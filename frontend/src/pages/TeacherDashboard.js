import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import TeacherAssignments from "./TeacherAssignments";
import TeacherQuizzes from "./TeacherQuizzes";
import {
   FaChalkboardTeacher, FaClipboardCheck, FaCalendarAlt, FaCalendarCheck,
   FaUserGraduate, FaBell, FaSignOutAlt, FaBars, FaCheckCircle,
   FaSave, FaMagic, FaSpinner, FaBullhorn, FaBookReader, FaTimes, FaClipboardList,
   FaLightbulb, FaCommentDots, FaQuestionCircle, FaSun, FaMoon
} from "react-icons/fa";

import LibraryDashboard from "./LibraryDashboard";
import TeacherTimetable from "./TeacherTimetable";
// import StudentLeaves from "./StudentLeaves"; // Removed unused import
import AdminLeaves from "./AdminLeaves"; // Added for approval
import Chat from "./Chat";
import DoubtForum from "./DoubtForum";

function TeacherDashboard() {
   const { theme, toggleTheme } = useContext(ThemeContext);
   const { user, logout } = useContext(AuthContext);

   // State
   const [loading, setLoading] = useState(true);
   const [activeMenu, setActiveMenu] = useState("dashboard");
   const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
   const [refreshKey, setRefreshKey] = useState(0);

   // Data States
   const [data, setData] = useState({ classes: [], exams: [], timetable: [] });
   const [notices, setNotices] = useState([]);
   const [students, setStudents] = useState([]);
   const [selection, setSelection] = useState({ classId: "", date: "", examId: "" });

   // Form Maps
   const [attendanceMap, setAttendanceMap] = useState({});
   const [marksMap, setMarksMap] = useState({});
   const [remarksMap, setRemarksMap] = useState({});

   // UI States
   const [alertInfo, setAlertInfo] = useState({ show: false, type: "", msg: "" });
   const [aiLoading, setAiLoading] = useState({});

   // Fetch Data
   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth > 1024) setShowSidebar(true);
         else setShowSidebar(false);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, []);

   useEffect(() => {
      const loadData = async () => {
         try {
            const results = await Promise.allSettled([
               api.get("/api/classes"),
               api.get("/api/exams"),
               api.get("/api/timetable/teacher"),
               api.get("/api/notices")
            ]);

            setData({
               classes: results[0].status === 'fulfilled' ? results[0].value.data : [],
               exams: results[1].status === 'fulfilled' ? results[1].value.data : [],
               timetable: results[2].status === 'fulfilled' ? results[2].value.data : []
            });

            if (results[3].status === 'fulfilled') {
               setNotices(results[3].value.data);
            }

         } catch (err) { console.error(err); }
         finally { setLoading(false); }
      };
      loadData();
   }, [refreshKey]);

   const showAlert = (type, msg) => { setAlertInfo({ show: true, type, msg }); setTimeout(() => setAlertInfo({ show: false }), 3000); };

   // Attendance Logic
   const fetchStudentsForClass = async (classId) => {
      setSelection(prev => ({ ...prev, classId }));
      setStudents([]); setAttendanceMap({});
      if (!classId) return;
      try {
         const res = await api.get(`/api/classes/${classId}/students`);
         setStudents(res.data);
      } catch { showAlert("danger", "Failed to load students"); }
   };

   const markAttendance = (studentId, status) => {
      setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
   };

   const submitAttendance = async () => {
      if (!selection.classId || !selection.date) return showAlert("warning", "Select Class and Date");
      try {
         await Promise.all(Object.keys(attendanceMap).map(sid =>
            api.post("/api/attendance", { studentId: sid, classId: selection.classId, date: selection.date, status: attendanceMap[sid] })
         ));
         showAlert("success", "Attendance Saved");
         setStudents([]); setAttendanceMap({}); setSelection(prev => ({ ...prev, classId: "" }));
         setRefreshKey(k => k + 1);
      } catch { showAlert("danger", "Failed to save"); }
   };

   // Marks and AI Logic
   const fetchStudentsForExam = async (examId) => {
      setSelection(prev => ({ ...prev, examId }));
      setStudents([]); setMarksMap({}); setRemarksMap({});

      if (!examId) return;
      const exam = data.exams.find(e => e._id === examId);
      if (!exam?.classId?._id) return;
      try {
         const res = await api.get(`/api/users/students-by-class?classId=${exam.classId._id}`);
         setStudents(res.data);
      } catch { showAlert("danger", "Failed to load students"); }
   };

   // AI Generator Function
   const generateAiRemark = async (studentId, studentName) => {
      const mark = marksMap[studentId];
      if (!selection.examId || !mark) {
         return showAlert("warning", "Enter marks first!");
      }
      const examObj = data.exams.find(e => e._id === selection.examId);
      const subjectName = examObj ? examObj.subject : "Subject";

      setAiLoading(prev => ({ ...prev, [studentId]: true }));

      try {
         const res = await api.post("/api/ai/generate-remark", {
            studentName,
            subject: subjectName,
            marks: mark,
            totalMarks: 100
         });
         setRemarksMap(prev => ({ ...prev, [studentId]: res.data.remark }));
      } catch (err) {
         showAlert("danger", "AI Error. Check backend console.");
      } finally {
         setAiLoading(prev => ({ ...prev, [studentId]: false }));
      }
   };

   const submitMarks = async () => {
      try {
         await Promise.all(students.map(s => {
            const mark = marksMap[s._id];
            if (!mark) return null;
            return api.post("/api/results", {
               examId: selection.examId,
               studentId: s._id,
               marksObtained: Number(mark)
            });
         }));
         showAlert("success", "Marks Saved Successfully!");
         setStudents([]); setMarksMap({}); setRemarksMap({}); setSelection(prev => ({ ...prev, examId: "" }));
         setRefreshKey(k => k + 1);
      } catch { showAlert("danger", "Failed to save"); }
   };

   if (loading) return <Loader text="Loading Teacher Portal..." />;

   const menuItems = [
      { id: "dashboard", label: "Overview", icon: FaChalkboardTeacher },
      { id: "chat", label: "Messages", icon: FaCommentDots },
      { id: "assignments", label: "Assignments", icon: FaClipboardList },
      { id: "doubts", label: "Discussion Forum", icon: FaQuestionCircle },
      { id: "quizzes", label: "Online Quizzes", icon: FaLightbulb },
      { id: "attendance", label: "Mark Attendance", icon: FaClipboardCheck },
      { id: "marks", label: "Enter Marks (AI)", icon: FaMagic },
      { id: "leaves", label: "Leave Requests", icon: FaCalendarCheck },
      { id: "library", label: "Library Hub", icon: FaBookReader },
      { id: "timetable", label: "My Timetable", icon: FaCalendarAlt },
   ];

   return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">

         {/* Mobile Backdrop */}
         {showSidebar && window.innerWidth < 1024 && (
            <div
               className="fixed inset-0 bg-black/50 z-40 lg:hidden"
               onClick={() => setShowSidebar(false)}
            />
         )}

         {/* Sidebar */}
         <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out transform lg:relative lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-6 bg-slate-950/50 sidebar-header">
               <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-1.5 rounded-lg">
                     <FaChalkboardTeacher className="text-white" size={18} />
                  </div>
                  <span className="font-bold text-lg tracking-tight">Teacher Portal</span>
               </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Toggle Theme"
               >
                  {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
               </button>
               <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setShowSidebar(false)}>
                  <FaTimes size={20} />
               </button>
            </div>
         </div>

            <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
               {menuItems.map((item) => (
                  <button
                     key={item.id}
                     onClick={() => {
                        setActiveMenu(item.id);
                        setStudents([]);
                        setSelection({ classId: "", date: "", examId: "" });
                        if (window.innerWidth < 1024) setShowSidebar(false);
                     }}
                     className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeMenu === item.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                  >
                     <item.icon className={`text-lg ${activeMenu === item.id ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                     <span>{item.label}</span>
                  </button>
               ))}
            </div>
         </div>

         {/* Main Content */}
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Header */}
            <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
               <div className="flex items-center">
                  <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
                     <FaBars className="text-slate-600 dark:text-slate-400" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">
                     {activeMenu === 'marks' ? 'AI Results Entry' : activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
                  </h2>
               </div>

               <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col items-end">
                     <span className="font-bold text-sm text-slate-800 dark:text-white">{user?.name}</span>
                     <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Teacher</span>
                  </div>
                  <button
                     onClick={logout}
                     className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                     Logout <FaSignOutAlt className="ml-2" />
                  </button>
               </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
               {alertInfo.show && (
                  <div className="mb-6">
                     <AlertMessage type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({ show: false })} />
                  </div>
               )}

               {/* Dashboard View */}
               {activeMenu === "dashboard" && (
                  <div className="animate-fadeIn space-y-6">

                     {/* Notice Board Widget */}
                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
                        <h6 className="font-bold text-blue-800 mb-4 flex items-center">
                           <FaBell className="text-blue-600 mr-2" /> Staff Notices
                        </h6>
                        {notices.length === 0 ? (
                           <p className="text-slate-500 text-sm italic">No active notices.</p>
                        ) : (
                           <div className="space-y-3">
                              {notices.slice(0, 3).map(n => (
                                 <div key={n._id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex items-start">
                                    <FaBullhorn className="mt-1 mr-3 text-blue-500 flex-shrink-0" />
                                    <div>
                                       <strong className="block text-slate-800 text-sm mb-1">{n.title}</strong>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(n.date || n.createdAt || Date.now()).toLocaleDateString()}</p>
                                       <p className="text-slate-600 text-sm">{n.content}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Classes</p>
                              <h1 className="text-3xl font-bold text-slate-800">{data.classes.length}</h1>
                           </div>
                           <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                              <FaUserGraduate size={28} />
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weekly Lectures</p>
                              <h1 className="text-3xl font-bold text-slate-800">{data.timetable.length}</h1>
                           </div>
                           <div className="bg-green-50 p-4 rounded-full text-green-600">
                              <FaCalendarAlt size={28} />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* Assignments View */}
               {activeMenu === "assignments" && (
                  <div className="animate-fadeIn">
                     <TeacherAssignments />
                  </div>
               )}

               {/* Quizzes View */}
               {activeMenu === "quizzes" && (
                  <div className="animate-fadeIn">
                     <TeacherQuizzes />
                  </div>
               )}

               {/* Attendance View */}
               {activeMenu === "attendance" && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                     <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <h5 className="font-bold text-slate-800">Attendance Register</h5>
                        <button
                           onClick={submitAttendance}
                           disabled={students.length === 0}
                           className={`flex items-center px-4 py-2 rounded-lg font-bold shadow-sm transition-colors ${students.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                        >
                           <FaCheckCircle className="mr-2" /> Submit Data
                        </button>
                     </div>

                     <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                           <select
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              value={selection.classId}
                              onChange={(e) => fetchStudentsForClass(e.target.value)}
                           >
                              <option value="">Choose Class...</option>
                              {data.classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section ? `- ${c.section}` : ''}</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                              <input
                                 type="date"
                                 className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 value={selection.date}
                                 onChange={(e) => setSelection(prev => ({ ...prev, date: e.target.value }))}
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Select Subject (Optional)</label>
                              <input
                                 type="text"
                                 className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                 placeholder="e.g. Mathematics"
                                 value={selection.subject || ""}
                                 onChange={(e) => setSelection(prev => ({ ...prev, subject: e.target.value }))}
                                 list="subject-suggestions"
                              />
                              <datalist id="subject-suggestions">
                                 {[...new Set([...data.timetable.map(t => t.subject), ...data.exams.map(e => e.subject)])].filter(Boolean).map(s => <option key={s} value={s} />)}
                              </datalist>
                           </div>
                        </div>
                     </div>

                     {students.length > 0 ? (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th className="px-6 py-4">SRN</th>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Attendance Status</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {students.map(s => (
                                    <tr key={s._id} className="hover:bg-slate-50">
                                       <td className="px-6 py-4 font-mono text-slate-600 font-semibold">{s.admissionId || "N/A"}</td>
                                       <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                                       <td className="px-6 py-4">
                                          <div className="flex gap-2">
                                             <button
                                                onClick={() => markAttendance(s._id, 'Present')}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${attendanceMap[s._id] === 'Present'
                                                   ? "bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2"
                                                   : "bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600"
                                                   }`}
                                             >
                                                Present
                                             </button>
                                             <button
                                                onClick={() => markAttendance(s._id, 'Absent')}
                                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${attendanceMap[s._id] === 'Absent'
                                                   ? "bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-2"
                                                   : "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                                   }`}
                                             >
                                                Absent
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     ) : (
                        <div className="p-12 text-center">
                           <p className="text-slate-400 italic">Select a class to load student list.</p>
                        </div>
                     )}
                  </div>
               )}

               {/* Marks View */}
               {activeMenu === "marks" && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                     <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                           <h5 className="font-bold text-slate-800">Results Entry</h5>
                           <p className="text-xs text-slate-500">Enter marks and use AI for remarks</p>
                        </div>
                        <button
                           onClick={submitMarks}
                           disabled={students.length === 0}
                           className={`flex items-center px-4 py-2 rounded-lg font-bold shadow-sm transition-colors ${students.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                        >
                           <FaSave className="mr-2" /> Save Marks
                        </button>
                     </div>

                     <div className="p-6 border-b border-slate-100 max-w-md">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Examination</label>
                        <select
                           className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                           value={selection.examId}
                           onChange={(e) => fetchStudentsForExam(e.target.value)}
                        >
                           <option value="">Choose Exam...</option>
                           {data.exams.map(e => <option key={e._id} value={e._id}>{e.name} ({e.subject})</option>)}
                        </select>
                     </div>

                     {students.length > 0 ? (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                              <thead>
                                 <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4 w-40">Marks Obtained</th>
                                    <th className="px-6 py-4 w-[40%]">AI Performance Remark</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                 {students.map(s => (
                                    <tr key={s._id} className="hover:bg-slate-50">
                                       <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                                       <td className="px-6 py-4">
                                          <input
                                             type="number"
                                             className="w-full px-3 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                             placeholder="0"
                                             value={marksMap[s._id] || ''}
                                             onChange={(e) => setMarksMap({ ...marksMap, [s._id]: e.target.value })}
                                          />
                                       </td>
                                       <td className="px-6 py-4">
                                          <div className="flex gap-2">
                                             <input
                                                type="text"
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                                placeholder="Remark..."
                                                value={remarksMap[s._id] || ''}
                                                onChange={(e) => setRemarksMap({ ...marksMap, [s._id]: e.target.value })}
                                             />
                                             <button
                                                onClick={() => generateAiRemark(s._id, s.name)}
                                                disabled={aiLoading[s._id]}
                                                className="px-3 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded transition-colors flex items-center justify-center min-w-[50px]"
                                                title="Generate AI Remark"
                                             >
                                                {aiLoading[s._id] ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     ) : (
                        <div className="p-12 text-center">
                           <p className="text-slate-400 italic">Select an exam to load student list.</p>
                        </div>
                     )}
                  </div>
               )}

               {/* Library View */}
               {activeMenu === "library" && (
                  <div className="animate-fadeIn">
                     <LibraryDashboard />
                  </div>
               )}

               {/* Timetable View */}
               {activeMenu === "timetable" && (
                  <div className="animate-fadeIn">
                     <TeacherTimetable />
                  </div>
               )}

               {activeMenu === "chat" && (
                  <div className="animate-fadeIn">
                     <Chat />
                  </div>
               )}

               {activeMenu === "doubts" && (
                  <div className="animate-fadeIn">
                     <DoubtForum />
                  </div>
               )}

               {activeMenu === "leaves" && (
                  <div className="animate-fadeIn">
                     <AdminLeaves />
                  </div>
               )}

            </main>
         </div>
      </div>
   );
}

export default TeacherDashboard;