import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";

// Sub-components
import StudentAttendance from "../pages/StudentAttendance";
import StudentTimetable from "../pages/StudentTimetable";
import StudentResults from "../pages/StudentResults";
import LibraryDashboard from "../pages/LibraryDashboard";


// ... existing code ...



import {
  FaBars, FaTachometerAlt, FaClipboardCheck, FaBook, FaCalendarAlt,
  FaFilePdf, FaUserGraduate, FaBullhorn,
  FaBookReader, FaTimes, FaSignOutAlt, FaPrint
} from "react-icons/fa";

function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    attendancePercent: 0,
    examsTaken: 0,
    feeStatus: "Pending"
  });

  const [notices, setNotices] = useState([]);
  const [fee, setFee] = useState(null);


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
        // Fetch Profile & Notices first (Critical for UI)
        const [profileRes, noticesRes] = await Promise.allSettled([
          api.get("/api/auth/profile"),
          api.get("/api/notices")
        ]);

        if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
        if (noticesRes.status === "fulfilled") setNotices(noticesRes.value.data || []);

        setLoading(false); // Show UI sooner

        // Fetch Stats & Fees in background
        const [attendanceRes, resultsRes, feeRes] = await Promise.allSettled([
          api.get("/api/attendance/me"),
          api.get("/api/results/student"),
          api.get("/api/fees/my-fee")
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

        setStats(newStats);

      } catch (err) {
        console.error("Dashboard data load failed", err);
        setLoading(false);
      }
    };
    fetchCoreData();
  }, []);


  // Removed redundant useEffect for fees



  const menus = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "profile", label: "My Profile", icon: FaUserGraduate },
    { id: "attendance", label: "Attendance", icon: FaClipboardCheck },
    { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
    { id: "results", label: "Results", icon: FaBook },
    { id: "library", label: "Library Hub", icon: FaBookReader },
    { id: "fees", label: "Fee Receipt", icon: FaFilePdf },
  ];

  if (loading) return <Loader text="Loading Student Portal..." />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

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
              <FaUserGraduate className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">Student Portal</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setShowSidebar(false)}>
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menus.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'profile') {
                  navigate('/profile');
                  return;
                }
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
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 lg:hidden">
              <FaBars className="text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
              {activeMenu === 'dashboard' ? 'Overview' : activeMenu.replace("-", " ")}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-sm text-slate-800">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Student</span>
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h6 className="font-bold text-slate-800 flex items-center">
                    <FaBullhorn className="mr-2 text-orange-500" /> Recent School Notices
                  </h6>
                </div>
                <div className="p-6 space-y-4">
                  {notices.length === 0 ? (
                    <p className="text-slate-400 italic text-center text-sm">No notices posted recently.</p>
                  ) : (
                    notices.slice(0, 3).map((n, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 text-sm mb-1">{n.title}</h5>
                          <p className="text-slate-600 text-sm leading-relaxed">{n.content}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
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

          {activeMenu === "profile" && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="px-6 pb-8 relative">
                  <div className="flex flex-col md:flex-row items-end -mt-12 mb-6">
                    <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg">
                      <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-3xl font-bold border-2 border-white uppercase">
                        {user?.name?.charAt(0) || "S"}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-4 flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                      <p className="text-slate-500 text-sm font-medium">Student • {profile?.admissionId || "SRN Loading..."}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Details */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h6 className="uppercase text-xs font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Personal Information</h6>
                      <div className="space-y-4">
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">Email</span> <span className="text-slate-800 font-medium text-sm">{user?.email}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">DOB</span> <span className="text-slate-800 font-medium text-sm">{profile?.dob ? new Date(profile.dob).toLocaleDateString() : "Not Provided"}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">Blood Group</span> <span className="text-slate-800 font-medium text-sm">{profile?.bloodGroup || "N/A"}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">Admission ID</span> <span className="text-slate-800 font-medium text-sm">{profile?.admissionId || "-"}</span></div>
                      </div>
                    </div>

                    {/* Family & Contact */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h6 className="uppercase text-xs font-bold text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Family & Contact</h6>
                      <div className="space-y-4">
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">Father</span> <span className="text-slate-800 font-medium text-sm">{profile?.fatherName || "-"}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">Mother</span> <span className="text-slate-800 font-medium text-sm">{profile?.motherName || "-"}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500 uppercase font-semibold">Phone</span> <span className="text-slate-800 font-medium text-sm">{profile?.phoneNumber || "-"}</span></div>
                        <div><span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Address</span> <span className="text-slate-800 font-medium text-sm block leading-snug">{profile?.address || "-"}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "attendance" && <StudentAttendance />}
          {activeMenu === "timetable" && <StudentTimetable />}
          {activeMenu === "results" && <StudentResults />}
          {activeMenu === "library" && <LibraryDashboard />}

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

        </main>
      </div >
    </div >
  );
}

export default StudentDashboard;