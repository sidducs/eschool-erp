import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
// import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

// Sub-components
import StudentAssignments from "../pages/StudentAssignments";
import StudentAttendance from "../pages/StudentAttendance";
import StudentTimetable from "../pages/StudentTimetable";
import StudentResults from "../pages/StudentResults";
import LibraryDashboard from "../pages/LibraryDashboard";
import Profile from "../pages/Profile";
import StudentQuizzes from "../pages/StudentQuizzes";
import StudentLeaves from "../pages/StudentLeaves";
import Chat from "../pages/Chat";
import DoubtForum from "../pages/DoubtForum";
import CertificateGenerator from "../pages/CertificateGenerator";
import StudentTransport from "../pages/StudentTransport"; // Added
import StudentIDCard from "./StudentIDCard";

import {
  FaBars, FaTachometerAlt, FaClipboardCheck, FaBook, FaCalendarAlt,
  FaFilePdf, FaUserGraduate, FaBullhorn,
  FaBookReader, FaTimes, FaSignOutAlt, FaPrint, FaClipboardList, FaLightbulb, FaBus, FaQuestionCircle, FaCertificate, FaCommentDots, FaSun, FaMoon, FaIdCard
} from "react-icons/fa";

function StudentDashboard() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  // const navigate = useNavigate(); // Unused

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
  // const [profile, setProfile] = useState(null); // Unused
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    attendancePercent: 0,
    examsTaken: 0,
    feeStatus: "Pending"
  });

  const [notices, setNotices] = useState([]);
  const [fee, setFee] = useState(null);
  const [events, setEvents] = useState([]); // Added events state


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setShowSidebar(true);
      else setShowSidebar(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Non-blocking data fetch
    const fetchCoreData = async () => {
      try {
        setLoading(true);
        const [noticesRes] = await Promise.allSettled([
          // api.get("/api/auth/profile"), // Unused
          api.get("/api/notices")
        ]);

        if (noticesRes.status === "fulfilled") setNotices(noticesRes.value.data || []);

        setLoading(false); // Show UI sooner

        // Fetch Stats & Fees in background
        const [attendanceRes, resultsRes, feeRes, eventsRes] = await Promise.allSettled([
          api.get("/api/attendance/me"),
          api.get("/api/results/student"),
          api.get("/api/fees/my-fee"),
          api.get("/api/events")
        ]);

        const newStats = {
          attendancePercent: 0,
          examsTaken: 0,
          feeStatus: "Pending"
        };

        if (attendanceRes.status === "fulfilled") newStats.attendancePercent = attendanceRes.value.data?.percentage || 0;
        if (resultsRes.status === "fulfilled") newStats.examsTaken = resultsRes.value.data?.length || 0;

        if (feeRes.status === "fulfilled") {
          setFee(feeRes.value.data);
          newStats.feeStatus = feeRes.value.data?.status || "Pending";
        }

        if (eventsRes.status === "fulfilled") setEvents(eventsRes.value.data || []);

        setStats(newStats);

      } catch (err) {
        console.error("Dashboard data load failed", err);
        setLoading(false);
      }
    };
    fetchCoreData();
  }, []);

  const menus = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "profile", label: "My Profile", icon: FaUserGraduate },
    { id: "chat", label: "Messages", icon: FaCommentDots },
    { id: "assignments", label: "Assignments", icon: FaClipboardList },
    { id: "doubts", label: "Discussion Forum", icon: FaQuestionCircle },
    { id: "certificates", label: "Certificates", icon: FaCertificate },
    { id: "quizzes", label: "Online Quizzes", icon: FaLightbulb },
    { id: "attendance", label: "Attendance", icon: FaClipboardCheck },
    { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
    { id: "results", label: "Results", icon: FaBook },
    { id: "events", label: "Academic Calendar", icon: FaCalendarAlt }, // Added
    { id: "leaves", label: "Leave Applications", icon: FaClipboardCheck },
    { id: "library", label: "Library Hub", icon: FaBookReader },
    { id: "transport", label: "Transport Routes", icon: FaBus },
    { id: "fees", label: "Fee Receipt", icon: FaFilePdf },
    { id: "idcard", label: "My ID Card", icon: FaIdCard },
  ];

  if (loading) return <Loader text="Loading Student Portal..." />;

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
            <div className="bg-transparent p-1.5">
              <img src="/eschool-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight">Student Portal</span>
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
          {menus.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
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
              {activeMenu === 'dashboard' ? 'Overview' : activeMenu.replace("-", " ")}
            </h2>
          </div>

            <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-sm text-slate-800 dark:text-white">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Student</span>
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

          {activeMenu === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">

              {/* Notices (Priority) */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl shadow-lg overflow-hidden mb-6 text-white relative">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                  <h6 className="font-bold flex items-center gap-3 text-lg">
                    <div className="bg-orange-500 p-2 rounded-lg text-white shadow-lg shadow-orange-500/30">
                      <FaBullhorn size={16} />
                    </div>
                    Notice Board
                  </h6>
                  <span className="text-xs font-medium bg-white/10 px-3 py-1 rounded-full border border-white/5">
                    Latest Updates
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  {notices.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                      <p className="italic">No new notices at the moment.</p>
                    </div>
                  ) : (
                    notices.slice(0, 3).map((n, i) => (
                      <div key={i} className="group relative pl-4 border-l-2 border-white/20 hover:border-orange-500 transition-colors">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400">
                            {new Date(n.date || n.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <h5 className="font-bold text-white text-sm truncate">{n.title}</h5>
                        </div>
                        <p className="text-white/70 text-xs line-clamp-2 leading-relaxed group-hover:text-white/90 transition-colors">
                          {n.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attendance</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold text-blue-600">{stats.attendancePercent}%</h3>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaClipboardCheck size={20} /></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exams Taken</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-3xl font-bold text-slate-800">{stats.examsTaken}</h3>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaBook size={20} /></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fee Status</p>
                  <div className="flex items-end justify-between">
                    <h3 className={`text-3xl font-bold ${stats.feeStatus === "PAID" ? "text-green-600" : "text-amber-500"}`}>{stats.feeStatus}</h3>
                    <div className={`p-2 rounded-lg ${stats.feeStatus === "PAID" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                      <FaFilePdf size={20} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeMenu === "profile" && <Profile />}
          {activeMenu === "assignments" && <StudentAssignments />}
          {activeMenu === "doubts" && <DoubtForum />}
          {activeMenu === "certificates" && <CertificateGenerator />}
          {activeMenu === "quizzes" && <StudentQuizzes />}

          {activeMenu === "attendance" && <StudentAttendance />}
          {activeMenu === "timetable" && <StudentTimetable />}
          {activeMenu === "results" && <StudentResults />}
          {activeMenu === "leaves" && <StudentLeaves />}
          {activeMenu === "chat" && <Chat />}
          {activeMenu === "library" && <LibraryDashboard />}
          {activeMenu === "transport" && <StudentTransport />}

          {/* EVENTS CALENDAR */}
          {activeMenu === "events" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl text-white shadow-lg mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <FaCalendarAlt /> Academic Calendar
                </h2>
                <p className="text-blue-100 mt-2">Stay updated with upcoming holidays, exams, and school events.</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <h5 className="font-bold text-lg text-slate-800 mb-6">Upcoming Events</h5>
                {(events.length === 0) ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FaCalendarAlt className="mx-auto text-slate-300 text-4xl mb-3" />
                    <p className="text-slate-500 font-medium">No upcoming events scheduled.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {events.map((ev, i) => (
                      <div key={i} className="flex gap-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow hover:border-blue-200">
                        <div className={`flex-shrink-0 w-20 h-20 rounded-xl flex flex-col justify-center items-center text-white font-bold shadow-sm ${ev.type === 'holiday' ? 'bg-red-500' :
                          ev.type === 'exam' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                          <span className="text-xs uppercase tracking-wider">{new Date(ev.startDate).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-3xl leading-none">{new Date(ev.startDate).getDate()}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h6 className="font-bold text-slate-800 text-lg">{ev.title}</h6>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${ev.type === 'holiday' ? 'bg-red-50 text-red-600' :
                                ev.type === 'exam' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                {ev.type}
                              </span>
                            </div>
                            <span className="text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded">
                              {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 text-sm mt-2 leading-relaxed">{ev.description || "No additional details provided."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "fees" && (
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h5 className="font-bold text-slate-800">Fee Statement</h5>
                {fee?.status === "PAID" && (
                  <button className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors" onClick={() => window.open(`/receipt/${fee._id}`, '_blank')}>
                    <FaPrint className="mr-2" /> View & Print Receipt
                  </button>
                )}
              </div>

              <div className="p-8">
                {fee ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 bg-slate-50 p-6 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Fee</p>
                          <p className="text-2xl font-mono font-bold text-slate-800">₹{fee.totalFee?.toLocaleString()}</p>
                        </div>
                        <div className="border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Paid Amount</p>
                          <p className="text-2xl font-mono font-bold text-green-600">₹{fee.paidAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Balance Due</p>
                          <p className={`text-2xl font-mono font-bold ${(fee.totalFee - fee.paidAmount) > 0 ? "text-red-500" : "text-slate-400"}`}>
                            ₹{(fee.totalFee - fee.paidAmount)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {fee.breakdown && fee.breakdown.length > 0 && (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 uppercase font-bold text-xs">
                            <tr>
                              <th className="px-6 py-3">Fee Component</th>
                              <th className="px-6 py-3 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {fee.breakdown.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-100 transition-colors">
                                <td className="px-6 py-3 font-medium text-slate-700">{item.name || item.title}</td>
                                <td className="px-6 py-3 text-right font-mono text-slate-600">₹{item.amount.toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-100 font-bold border-t border-slate-200">
                              <td className="px-6 py-3 text-slate-800">Total</td>
                              <td className="px-6 py-3 text-right text-slate-900">₹{fee.totalFee.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {fee.status !== "PAID" && (
                      <div className="text-center">
                        <p className="text-sm text-slate-500">Please contact the administration office to clear your pending dues.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaFilePdf size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">No fee records found for current term.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMenu === "idcard" && <StudentIDCard />}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;