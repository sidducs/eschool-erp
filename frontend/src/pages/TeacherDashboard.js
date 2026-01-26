import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import { 
  FaChalkboardTeacher, FaClipboardCheck,  FaCalendarAlt, 
  FaUserGraduate, FaBell, FaSignOutAlt, FaBars, FaCheckCircle, 
   FaSave, FaMagic, FaSpinner, FaBullhorn, FaBookReader 
} from "react-icons/fa";

import LibraryDashboard from "./LibraryDashboard"; 

function TeacherDashboard() {
  const { user, logout } = useContext(AuthContext);

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); 
  
  // Data States
  const [data, setData] = useState({ classes: [], exams: [], timetable: [] });
  const [notices, setNotices] = useState([]); // <--- NOTICE STATE
  const [students, setStudents] = useState([]); 
  const [selection, setSelection] = useState({ classId: "", date: "", examId: "" });
  
  // Form Maps
  const [attendanceMap, setAttendanceMap] = useState({});
  const [marksMap, setMarksMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({}); 
  
  // UI States
  const [alertInfo, setAlertInfo] = useState({ show: false, type: "", msg: "" });
  const [aiLoading, setAiLoading] = useState({}); 

  // --- STYLES ---
  const styles = {
    font: { fontFamily: "'Inter', sans-serif" },
    sidebar: { backgroundColor: "#1e293b", minHeight: "100vh", color: "#f8fafc" },
    main: { backgroundColor: "#f8fafc", minHeight: "100vh" }, 
    card: { border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", background: "white" },
    labelText: { color: "#64748b", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
    tableHeader: { backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase" },
    menuBtn: (isActive) => ({
      backgroundColor: isActive ? "#3b82f6" : "transparent",
      color: isActive ? "white" : "#cbd5e1",
      border: "none", padding: "12px 16px", width: "100%", textAlign: "left",
      borderRadius: "8px", marginBottom: "6px", fontSize: "0.95rem", fontWeight: "500",
      transition: "all 0.2s"
    })
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get("/api/classes"),
          api.get("/api/exams"),
          api.get("/api/timetable/teacher"),
          api.get("/api/notices") // <--- Fetch Notices
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

  // --- ATTENDANCE LOGIC ---
  const fetchStudentsForClass = async (classId) => {
    setSelection(prev => ({ ...prev, classId }));
    setStudents([]); setAttendanceMap({});
    if(!classId) return;
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

  // --- MARKS & AI LOGIC ---
  const fetchStudentsForExam = async (examId) => {
    setSelection(prev => ({ ...prev, examId }));
    setStudents([]); setMarksMap({}); setRemarksMap({});
    
    if(!examId) return;
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

  if (loading) return <Loader text="Loading..." />;

  return (
    <div className="d-flex" style={styles.font}>
      
      {/* SIDEBAR */}
      <div className={`d-none d-md-block p-3`} style={{ ...styles.sidebar, width: showSidebar ? "260px" : "0px", overflow: "hidden", transition: "width 0.3s" }}>
        <div className="d-flex align-items-center mb-5 px-2">
           <div className="bg-primary rounded p-2 me-2"><FaChalkboardTeacher size={20} color="white"/></div>
           <h5 className="mb-0 fw-bold text-white">Teacher Portal</h5>
        </div>
        {[
          { id: "dashboard", label: "Overview", icon: FaChalkboardTeacher },
          { id: "attendance", label: "Mark Attendance", icon: FaClipboardCheck },
          { id: "marks", label: "Enter Marks (AI)", icon: FaMagic },
          { id: "library", label: "Library Hub", icon: FaBookReader },
          { id: "timetable", label: "My Timetable", icon: FaCalendarAlt },
        ].map((m) => (
          <button key={m.id} style={styles.menuBtn(activeMenu === m.id)} onClick={() => { setActiveMenu(m.id); setStudents([]); setSelection({classId:"", date:"", examId:""}); }}>
            <m.icon className="me-3" style={{opacity: 0.8}} /> {m.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 p-4 p-md-5" style={{ ...styles.main, height: "100vh", overflowY: "auto" }}>
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-5">
           <div className="d-flex align-items-center">
              <FaBars className="d-md-none me-3 cursor-pointer text-muted" onClick={() => setShowSidebar(!showSidebar)} />
              <div>
                 <h2 className="fw-bold text-dark m-0">
                    {activeMenu === 'marks' ? 'AI Results Entry' : activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
                 </h2>
                 <p className="text-muted small m-0">Welcome back, {user?.name}</p>
              </div>
           </div>
           <div className="d-flex align-items-center gap-3">
              <div className="bg-white p-2 rounded-circle shadow-sm border"><FaBell color="#64748b"/></div>
              <button onClick={logout} className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold border-2">
                 Logout <FaSignOutAlt className="ms-1"/>
              </button>
           </div>
        </div>

        {alertInfo.show && <AlertMessage type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({show: false})} />}

        {/* --- DASHBOARD VIEW --- */}
        {activeMenu === "dashboard" && (
          <div className="fade-in">
             
             {/* NOTICE BOARD WIDGET */}
             <div className="row mb-4">
               <div className="col-12">
                 <div className="card border-0 shadow-sm p-3 bg-white" style={styles.card}>
                   <h6 className="fw-bold mb-3 border-bottom pb-2">
                      <FaBell className="text-warning me-2"/> Staff Notices
                   </h6>
                   {notices.length === 0 ? (
                     <p className="text-muted small">No active notices.</p>
                   ) : (
                     notices.slice(0,3).map(n => (
                       <div key={n._id} className="alert alert-info border-0 mb-2 py-2 d-flex align-items-center">
                         <FaBullhorn className="me-2 text-info"/>
                         <div>
                            <strong>{n.title}</strong> <span className="text-muted small mx-2">|</span> <span className="small">{n.content}</span>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             </div>

             {/* STATS */}
             <div className="row g-4 mb-4">
                <div className="col-md-6">
                   <div className="p-4 h-100 bg-white" style={styles.card}>
                      <div className="d-flex justify-content-between align-items-center">
                         <div><div style={styles.labelText}>Assigned Classes</div><h1 className="fw-bold mt-2 text-dark display-5">{data.classes.length}</h1></div>
                         <div className="bg-primary bg-opacity-10 text-primary p-4 rounded-circle"><FaUserGraduate size={32}/></div>
                      </div>
                   </div>
                </div>
                <div className="col-md-6">
                   <div className="p-4 h-100 bg-white" style={styles.card}>
                      <div className="d-flex justify-content-between align-items-center">
                         <div><div style={styles.labelText}>Weekly Lectures</div><h1 className="fw-bold mt-2 text-dark display-5">{data.timetable.length}</h1></div>
                         <div className="bg-success bg-opacity-10 text-success p-4 rounded-circle"><FaCalendarAlt size={32}/></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* --- ATTENDANCE VIEW --- */}
        {activeMenu === "attendance" && (
          <div style={styles.card} className="p-4 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 className="fw-bold m-0 text-dark">Daily Attendance</h5>
                <button className="btn btn-primary btn-sm fw-bold" onClick={submitAttendance} disabled={students.length===0}><FaCheckCircle className="me-2"/> Submit Data</button>
             </div>
             <div className="row g-3 mb-4">
                <div className="col-md-4">
                   <label style={styles.labelText}>Class</label>
                   <select className="form-select bg-light border-0" value={selection.classId} onChange={(e) => fetchStudentsForClass(e.target.value)}>
                      <option value="">Select...</option>
                      {data.classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section ? `- ${c.section}` : ''}</option>)}
                   </select>
                </div>
                <div className="col-md-4">
                   <label style={styles.labelText}>Date</label>
                   <input type="date" className="form-control bg-light border-0" value={selection.date} onChange={(e) => setSelection(prev => ({...prev, date: e.target.value}))} />
                </div>
             </div>
             {students.length > 0 && (
                <div className="table-responsive">
                   <table className="table table-bordered align-middle mb-0">
                      <thead style={styles.tableHeader}><tr><th>Roll</th><th>Student Name</th><th>Status</th></tr></thead>
                      <tbody>
                         {students.map(s => (
                            <tr key={s._id}>
                               <td className="fw-bold text-secondary">{s.rollNumber}</td>
                               <td className="fw-bold text-dark">{s.name}</td>
                               <td>
                                  <div className="d-flex gap-2">
                                     <button className={`btn btn-sm px-3 fw-bold ${attendanceMap[s._id] === 'Present' ? 'btn-success' : 'btn-light border'}`} onClick={() => markAttendance(s._id, 'Present')}>Present</button>
                                     <button className={`btn btn-sm px-3 fw-bold ${attendanceMap[s._id] === 'Absent' ? 'btn-danger' : 'btn-light border'}`} onClick={() => markAttendance(s._id, 'Absent')}>Absent</button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        )}

        {/* --- MARKS VIEW --- */}
        {activeMenu === "marks" && (
          <div style={styles.card} className="p-4 bg-white">
             <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h5 className="fw-bold m-0 text-dark">Results Entry & AI Remarks</h5>
                </div>
                <button className="btn btn-success btn-sm fw-bold" onClick={submitMarks} disabled={students.length===0}><FaSave className="me-2"/> Save Marks</button>
             </div>
             <div className="mb-4" style={{maxWidth: '400px'}}>
                <label style={styles.labelText}>Select Exam</label>
                <select className="form-select bg-light border-0" value={selection.examId} onChange={(e) => fetchStudentsForExam(e.target.value)}>
                   <option value="">Select...</option>
                   {data.exams.map(e => <option key={e._id} value={e._id}>{e.name} ({e.subject})</option>)}
                </select>
             </div>
             {students.length > 0 && (
                <div className="table-responsive">
                   <table className="table table-bordered align-middle">
                      <thead style={styles.tableHeader}><tr><th>Student</th><th>Marks</th><th style={{width: '40%'}}>AI Remark</th></tr></thead>
                      <tbody>
                         {students.map(s => (
                            <tr key={s._id}>
                               <td className="fw-bold text-dark">{s.name}</td>
                               <td style={{width: '150px'}}>
                                  <input type="number" className="form-control" value={marksMap[s._id]||''} onChange={(e)=>setMarksMap({...marksMap, [s._id]: e.target.value})} />
                               </td>
                               <td>
                                  <div className="input-group">
                                    <input type="text" className="form-control" value={remarksMap[s._id] || ''} onChange={(e)=>setRemarksMap({...remarksMap, [s._id]: e.target.value})} />
                                    <button className="btn btn-outline-primary" onClick={() => generateAiRemark(s._id, s.name)} disabled={aiLoading[s._id]}>
                                        {aiLoading[s._id] ? <FaSpinner className="fa-spin"/> : <FaMagic />}
                                    </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        )}

        {/* --- LIBRARY VIEW --- */}
        {activeMenu === "library" && (
          <div className="fade-in">
             <LibraryDashboard />
          </div>
        )}

        {/* --- TIMETABLE VIEW --- */}
        {activeMenu === "timetable" && (
          <div style={styles.card} className="p-4 bg-white">
             <h5 className="fw-bold mb-4 text-dark border-bottom pb-3">Weekly Schedule</h5>
             <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                   <thead style={styles.tableHeader}><tr><th className="ps-3">Day</th><th>Time</th><th>Class</th><th>Subject</th></tr></thead>
                   <tbody>
                      {data.timetable.map(t => (
                        <tr key={t._id}>
                           <td className="ps-3 fw-bold text-primary">{t.day}</td>
                           <td><span className="badge bg-light text-dark border">{t.timeSlot}</span></td>
                           <td>{t.classId?.name} {t.classId?.section ? `- ${t.classId.section}` : ''}</td>
                           <td className="fw-bold text-dark">{t.subject}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default TeacherDashboard;