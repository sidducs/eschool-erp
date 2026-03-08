import { useEffect, useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import Loader from "../components/Loader";
import ConfirmationModal from "../components/ConfirmationModal";
import { FaSun, FaMoon, FaTachometerAlt, FaUsers, FaMoneyBillWave, FaChalkboardTeacher,
  FaClipboardCheck, FaBook, FaUpload, FaBullhorn,
  FaUserGraduate, FaUserTie, FaBars, FaArrowLeft, FaEdit, FaTrash, FaPaperPlane,
  FaSearch, FaPrint, FaBookReader, FaTimes, FaUserPlus, FaCogs, FaMagic, FaUserCheck, FaLock, FaBus, FaCommentDots, FaCalendarAlt
} from "react-icons/fa";

import LibraryDashboard from "./LibraryDashboard";
import AdminAdmission from "./AdminAdmission";
import AdminCreateFeeStructure from "./AdminCreateFeeStructure";
import AdminSettings from "./AdminSettings";
import AdminTimetable from "./AdminTimetable";
import AdminLeaves from "./AdminLeaves";
import Chat from "./Chat"; // Enabled
import TransportManager from "./TransportManager";
import SendNotification from "./SendNotification";
import AdminAssignFee from "./AdminAssignFee";
import AdminBulkUpload from "./AdminBulkUpload";


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AdminDashboard() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const { addToast } = useToast(); // Use Global Toast
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
  const [data, setData] = useState({ users: [], classes: [], fees: [], exams: [], notices: [], stats: {} });
  const [formData, setFormData] = useState({ roleFilter: "all", day: "Monday" });
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentInputs, setPaymentInputs] = useState({}); // New State for Payments
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const chartData = {
    att: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [data.stats.attendancePercentage || 0, 100 - (data.stats.attendancePercentage || 0)],
        backgroundColor: ["#10b981", "#ef4444"],
        borderWidth: 0
      }]
    },
    fee: {
      labels: ["Collected", "Pending"],
      datasets: [{
        label: "Amount (₹)",
        data: [data.stats.fees?.collected || 0, data.stats.fees?.pending || 0],
        backgroundColor: ["#3b82f6", "#f59e0b"],
        borderRadius: 4,
        barThickness: 30
      }]
    }
  };

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
          api.get("/api/admin/users"), api.get("/api/classes"), api.get("/api/dashboard/admin"),
          api.get("/api/fees/student-fees"), api.get("/api/exams"), api.get("/api/notices"),
          api.get("/api/ai/weak-students"),
          api.get("/api/admin/audit-logs"),
          api.get("/api/events")
        ]);
        setData({
          users: results[0].status === 'fulfilled' ? results[0].value.data : [],
          classes: results[1].status === 'fulfilled' ? results[1].value.data : [],
          stats: results[2].status === 'fulfilled' ? results[2].value.data : {},
          fees: results[3].status === 'fulfilled' ? results[3].value.data : [],
          exams: results[4].status === 'fulfilled' ? results[4].value.data : [],
          notices: results[5].status === 'fulfilled' ? results[5].value.data : [],
          atRisk: results[6].status === 'fulfilled' ? results[6].value.data : [],
          logs: results[7].status === 'fulfilled' ? results[7].value.data : [],
          events: results[8].status === 'fulfilled' ? results[8].value.data : []
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const apiAction = async (method, url, payload, successMsg, menuRedirect) => {
    try {
      await api[method](url, payload);
      addToast(successMsg, "success");
      if (menuRedirect) {
        setActiveMenu(menuRedirect);
        setFormData({ roleFilter: "all" });
      }
      setRefreshKey(k => k + 1);
    } catch (err) { addToast(err.response?.data?.message || "Action Failed", "error"); }
  };




  const filteredUsers = (data.users || []).filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.admissionId && u.admissionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.rollNumber && u.rollNumber.toString().includes(searchTerm));
    const matchesRole = formData.roleFilter === "all" || u.role === formData.roleFilter;
    return matchesSearch && matchesRole;
  });

  const BackBtn = ({ to }) => (
    <button
      className="flex items-center text-slate-500 hover:text-slate-800 font-semibold mb-4 transition-colors"
      onClick={() => { setActiveMenu(to); setFormData({ roleFilter: "all" }); }}
    >
      <FaArrowLeft className="mr-2" /> Back to {to}
    </button>
  );

  const StatCard = ({ title, value, color, icon: Icon }) => {
    const colors = {
      primary: "bg-blue-50 text-blue-600",
      success: "bg-green-50 text-green-600",
      info: "bg-cyan-50 text-cyan-600",
      warning: "bg-amber-50 text-amber-600"
    };
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value || 0}</h3>
          </div>
          <div className={`p-3 rounded-lg ${colors[color] || colors.primary}`}>
            <Icon size={20} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <Loader text="Loading ERP System..." />;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "admission", label: "Admission", icon: FaUserPlus },
    { id: "pending", label: "Pending Approvals", icon: FaUserCheck },
    { id: "users", label: "User Management", icon: FaUsers },
    { id: "fees", label: "Finance & Fees", icon: FaMoneyBillWave },
    { id: "classes", label: "Classes & Sections", icon: FaChalkboardTeacher },
    { id: "leaves", label: "Leave Requests", icon: FaUserCheck },
    { id: "exams", label: "Examinations", icon: FaBook },
    { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
    { id: "library", label: "Library Hub", icon: FaBookReader },
    { id: "transport", label: "Transport", icon: FaBus },
    { id: "events", label: "Academic Calendar", icon: FaCalendarAlt },
    { id: "notices", label: "Notice Board", icon: FaBullhorn },
    { id: "chat", label: "Messages", icon: FaCommentDots },
    { id: "analytics", label: "AI Analytics", icon: FaMagic },
    { id: "audit", label: "Audit Logs", icon: FaLock },
    { id: "settings", label: "System Settings", icon: FaCogs },
    { id: "backup", label: "System Backup", icon: FaUpload },
    { id: "bulk", label: "Bulk Student Import", icon: FaUpload },
    { id: "send-notification", label: "Send Alerts", icon: FaPaperPlane },
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
            <a href="https://eschool-erp.vercel.app/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/eschool-logo-v3.png" alt="eSchool ERP" className="h-8 w-auto object-contain" />
              <span className="font-bold text-lg tracking-tight text-white">eSchool <span className="text-blue-400">ERP</span></span>
            </a>
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
                setFormData({ roleFilter: "all" });
                if (window.innerWidth < 1024) setShowSidebar(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeMenu.startsWith(item.id)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                : "text-slate-100 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <item.icon className={`text-lg ${activeMenu.startsWith(item.id) ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
              <FaBars className="text-slate-600 dark:text-slate-400" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">
              {activeMenu.split("-")[0].replace("users", "User Management").replace("classes", "Classes & Sections")}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-sm text-slate-800 dark:text-white">{user?.name || "Administrator"}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Admin</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {/* DASHBOARD VIEW */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={data.stats.users?.students} color="primary" icon={FaUserGraduate} />
                <StatCard title="Total Teachers" value={data.stats.users?.teachers} color="success" icon={FaUserTie} />
                <StatCard title="Fees Collected" value={`₹${data.stats.fees?.collected || 0}`} color="info" icon={FaMoneyBillWave} />
                <StatCard title="Fees Pending" value={`₹${data.stats.fees?.pending || 0}`} color="warning" icon={FaClipboardCheck} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-6">Attendance Overview</h4>
                  <div className="h-64 relative">
                    <Doughnut data={chartData.att} options={{ maintainAspectRatio: false, cutout: '70%' }} />
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-6">Financial Overview</h4>
                  <div className="h-64 relative">
                    <Bar data={chartData.fee} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "admission" && <AdminAdmission />}

          {activeMenu === "library" && <LibraryDashboard />}


          {activeMenu === "settings" && <AdminSettings />}

          {activeMenu === "leaves" && <AdminLeaves />}

          {activeMenu === "transport" && <TransportManager />}

          {/* AUDIT LOGS */}
          {activeMenu === "audit" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h5 className="font-bold text-slate-800 flex items-center gap-2">
                  <FaLock className="text-slate-500" /> System Security Audit Logs
                </h5>
                <span className="text-xs text-slate-400">Tracking user activities for security</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4">IP Address</th>
                      <th className="px-6 py-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.logs || []).map((log, i) => (
                      <tr key={i} className="hover:bg-slate-50 text-sm">
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {log.userId?.name || "Unknown"} <span className="text-xs font-normal text-slate-400">({log.userId?.role})</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-bold">{log.action}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{log.details}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ipAddress || "-"}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BACKUP */}
          {activeMenu === "backup" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                  <FaUpload /> System Maintenance & Backup
                </h5>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h6 className="font-bold text-blue-900 text-lg mb-1">Full Database Backup</h6>
                    <p className="text-blue-700 text-sm">Download a ZIP file containing all JSON collections (Users, Fees, Classes, etc.) for disaster recovery.</p>
                  </div>
                  <button
                    onClick={() => window.open(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/admin/backup`, "_blank")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <FaUpload className="rotate-180" /> Export Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeMenu === "send-notification" && <SendNotification />}

          {activeMenu === "chat" && <Chat />}

          {/* SETTINGS - Removed Duplicate Render */}
          {activeMenu === "analytics" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-2xl text-white shadow-lg">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <FaMagic /> AI Student Analytics
                </h2>
                <p className="text-purple-100 mt-2 max-w-2xl">
                  Our AI scans attendance records and academic results to identify students who might be falling behind.
                  Early intervention can significantly improve student outcomes.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
                  <h5 className="font-bold text-red-800 flex items-center gap-2">
                    <FaUserCheck className="text-red-500" /> At-Risk Students Identified
                  </h5>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    {data.atRisk?.length || 0} Alert(s)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Attendance</th>
                        <th className="px-6 py-4">Avg Marks</th>
                        <th className="px-6 py-4">Risk Factors</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.atRisk || []).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
                            Great news! No students currently flagged as "At-Risk".
                          </td>
                        </tr>
                      ) : (
                        (data.atRisk || []).map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {s.name}
                              <span className="block text-xs text-slate-400 font-normal">{s.admissionId}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold ${Number(s.attendance) < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                {s.attendance}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold ${Number(s.avgMarks) < 40 ? 'text-red-600' : 'text-slate-700'}`}>
                                {s.avgMarks}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {s.risks.map((r, idx) => (
                                  <span key={idx} className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-semibold border border-red-100">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-bold hover:underline">
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS MANAGEMENT */}
          {activeMenu === "users" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-2">
                  {["all", "student", "teacher", "admin"].map(role => (
                    <button
                      key={role}
                      onClick={() => setFormData({ ...formData, roleFilter: role })}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${formData.roleFilter === role
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}s
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search by name, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => setActiveMenu("users-create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    + Add User
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                        <th className="px-6 py-4">User Name</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">SRN</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              u.role === 'teacher' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-blue-100 text-blue-800 border-blue-200'
                              }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">{u.email}</td>
                          <td className="px-6 py-4 font-mono text-sm text-slate-600">
                            {u.role === 'student' ? (u.admissionId || "N/A") : "-"}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              onClick={() => { setFormData({ ...u, password: '' }); setActiveMenu("users-edit") }}
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              onClick={() => setModal({
                                isOpen: true,
                                title: "Delete User?",
                                message: `Are you sure you want to delete ${u.name}? This action cannot be undone.`,
                                onConfirm: () => apiAction('delete', `/api/admin/users/${u._id}`, null, "User deleted successfully", null)
                              })}
                            >
                              <FaTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No users found matching your criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CLASSES MANAGEMENT */}
          {activeMenu === "classes" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setActiveMenu("classes-create")}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <h6 className="font-bold text-slate-800 text-lg">Create New Class</h6>
                    <p className="text-slate-500 text-sm mt-1">Add a new academic class standard</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaChalkboardTeacher size={24} />
                  </div>
                </div>
                <div
                  onClick={() => setActiveMenu("classes-assign")}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <h6 className="font-bold text-slate-800 text-lg">Assign Student</h6>
                    <p className="text-slate-500 text-sm mt-1">Enroll students into classes</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <FaUsers size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h5 className="font-bold text-slate-800">Active Academic Classes</h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <th className="px-6 py-4">Class Name</th>
                        <th className="px-6 py-4">Section</th>
                        <th className="px-6 py-4">Academic Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.classes || []).map(c => (
                        <tr key={c._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                          <td className="px-6 py-4 text-slate-600">{c.section}</td>
                          <td className="px-6 py-4 text-slate-600">{c.academicYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FEES MANAGEMENT */}
          {activeMenu === "fees" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              {[
                { t: "Fee Structure", d: "Set class fee amounts", m: "fees-create", i: FaMoneyBillWave, c: "blue" },
                { t: "Assign Fees", d: "Charge students", m: "fees-assign", i: FaUserGraduate, c: "purple" },
                { t: "Payments", d: "Track status & history", m: "fees-view", i: FaClipboardCheck, c: "green" }
              ].map((x, i) => (
                <div
                  key={i}
                  onClick={() => setActiveMenu(x.m)}
                  className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer text-center group"
                >
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-${x.c}-50 text-${x.c}-600 mb-4 group-hover:scale-110 transition-transform`}>
                    <x.i size={32} />
                  </div>
                  <h6 className="font-bold text-slate-800 text-lg mb-1">{x.t}</h6>
                  <p className="text-slate-500 text-sm">{x.d}</p>
                </div>
              ))}
            </div>
          )}

          {activeMenu === "fees-create" && <AdminCreateFeeStructure goBack={() => setActiveMenu("fees")} />}


          {activeMenu === "fees-view" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <BackBtn to="fees" />
                <h6 className="font-bold text-slate-800">Fee Transactions</h6>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Total Fee</th>
                      <th className="px-6 py-4">Paid</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.fees || []).map(f => (
                      <tr key={f._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-800">{f.studentId?.name}</td>
                        <td className="px-6 py-4">₹{f.totalFee}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">₹{f.paidAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${f.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {f.status !== 'PAID' && (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                placeholder="₹ Amt"
                                className="w-24 px-2 py-1 border rounded text-sm"
                                value={paymentInputs[f.studentId?._id] || ""}
                                onChange={(e) => setPaymentInputs({ ...paymentInputs, [f.studentId?._id]: e.target.value })}
                              />
                              <button
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition"
                                onClick={() => {
                                  const amount = paymentInputs[f.studentId?._id] || 0;
                                  if (amount <= 0) return addToast("Enter valid amount", "warning");
                                  setModal({
                                    isOpen: true,
                                    title: "Confirm Payment",
                                    message: `Record payment of ₹${amount} for student ${f.studentId?.name || "Unknown"}?`,
                                    onConfirm: () => apiAction('put', '/api/fees/pay', { feeId: f._id, amount: Number(amount) }, "Payment Recorded", "fees")
                                  });
                                }}
                              >
                                Pay
                              </button>
                            </div>
                          )}
                          <button
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            onClick={() => window.open(`/receipt/${f._id}`, '_blank')}
                            title="Download PDF Receipt"
                          >
                            <FaPrint />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXAMS MANAGEMENT */}
          {activeMenu === "exams" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h6 className="font-bold text-slate-800">Scheduled Examinations</h6>
                <button
                  onClick={() => setActiveMenu("exams-create")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  + Schedule Exam
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                      <th className="px-6 py-4">Exam Name</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Class</th>
                      <th className="px-6 py-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(data.exams || []).map(e => (
                      <tr key={e._id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-800">{e.name}</td>
                        <td className="px-6 py-4">{e.subject}</td>
                        <td className="px-6 py-4 text-slate-600">{e.classId?.name}-{e.classId?.section}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(e.examDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EVENTS MANAGEMENT */}
          {activeMenu === "events" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              {/* Event Creation Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" /> Add Event
                </h5>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  apiAction('post', '/api/events', formData, "Event Added", null);
                  setFormData({}); // Reset form
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                    <input type="text" name="title" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required onChange={handleInputChange} value={formData.title || ""} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <select name="type" className="w-full px-3 py-2 border rounded-lg bg-white" onChange={handleInputChange} value={formData.type || "event"}>
                      <option value="event">General Event</option>
                      <option value="holiday">Holiday</option>
                      <option value="meeting">Meeting</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input type="date" name="startDate" className="w-full px-3 py-2 border rounded-lg" required onChange={handleInputChange} value={formData.startDate || ""} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input type="date" name="endDate" className="w-full px-3 py-2 border rounded-lg" required onChange={handleInputChange} value={formData.endDate || ""} />
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors shadow-sm">
                    Add to Calendar
                  </button>
                </form>
              </div>

              {/* Events List */}
              <div className="lg:col-span-2 space-y-4">
                <h5 className="font-bold text-lg text-slate-800">Upcoming Events</h5>
                {(!data.events || data.events.length === 0) ? (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                    No upcoming events scheduled.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {data.events.map(ev => (
                      <div key={ev._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-300 transition-colors">
                        <div className="flex gap-4">
                          <div className={`w-16 h-16 rounded-lg flex flex-col justify-center items-center text-white font-bold shadow-sm ${ev.type === 'holiday' ? 'bg-red-500' :
                            ev.type === 'exam' ? 'bg-purple-500' : 'bg-blue-500'
                            }`}>
                            <span className="text-xs uppercase">{new Date(ev.startDate).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-2xl leading-none">{new Date(ev.startDate).getDate()}</span>
                          </div>
                          <div>
                            <h6 className="font-bold text-slate-800 text-lg">{ev.title}</h6>
                            <p className="text-slate-500 text-sm">{ev.type.toUpperCase()} • {new Date(ev.startDate).toLocaleDateString()} - {new Date(ev.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setModal({
                            isOpen: true,
                            title: "Delete Event?",
                            message: `Delete event "${ev.title}"?`,
                            onConfirm: () => apiAction('delete', `/api/events/${ev._id}`, null, "Event Deleted", null)
                          })}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TIMETABLE */}
          {/* TIMETABLE */}
          {activeMenu === "timetable" && (
            <div className="animate-fadeIn">
              <AdminTimetable />
            </div>
          )}

          {/* NOTICE BOARD */}
          {activeMenu === "notices" && (
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
              <h5 className="font-bold text-xl text-slate-800 mb-6 flex items-center"><FaBullhorn className="mr-3 text-orange-500" /> Broadcast Notice</h5>
              <form onSubmit={(e) => { e.preventDefault(); apiAction('post', '/api/notices', formData, "Notice Posted", "notices"); }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
                    <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="title" placeholder="e.g., Holiday Announcement" onChange={handleInputChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" name="audience" onChange={handleInputChange}>
                      <option value="all">Everyone</option>
                      <option value="teacher">Teachers Only</option>
                      <option value="student">Students Only</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.title) return addToast("Please enter a Notice Title first.", "warning");
                        setAiLoading(true);
                        addToast("✨ AI is drafting your notice...", "info");
                        try {
                          const res = await api.post("/api/ai/generate-notice", { topic: formData.title });
                          if (res.data.content) {
                            setFormData(prev => ({ ...prev, content: res.data.content.trim() }));
                            addToast("✨ Notice drafted by AI!", "success");
                          }
                        } catch (err) {
                          console.error(err);
                          addToast("AI Draft Failed", "error");
                        } finally {
                          setAiLoading(false);
                        }
                      }}
                      className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                      disabled={aiLoading}
                    >
                      {aiLoading ? "..." : <><FaMagic /> AI Auto-Draft</>}
                    </button>
                  </div>
                  <textarea className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32" name="content" placeholder="Full notice details..." onChange={handleInputChange} value={formData.content || ""} required></textarea>
                </div>

                <div className="flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                  <input
                    type="checkbox"
                    id="isEmergency"
                    name="isEmergency"
                    checked={formData.isEmergency || false}
                    onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isEmergency" className="text-sm font-bold text-red-700 flex items-center gap-2">
                    <FaBullhorn /> Mark as Emergency Broadcast (Shows Red Banner to All Users)
                  </label>
                </div>

                <div className="flex justify-end">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm flex items-center transition-colors">
                    <FaPaperPlane className="mr-2" /> Send Broadcast
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PENDING APPROVALS */}
          {activeMenu === "pending" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/50">
                <h6 className="font-bold text-slate-800 flex items-center"><FaUserCheck className="mr-2 text-amber-600" /> Pending Student Approvals</h6>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.users.filter(u => u.status === 'pending' && u.role === 'student').length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500 italic">No pending applications</td></tr>
                    ) : (
                      data.users.filter(u => u.status === 'pending' && u.role === 'student').map(u => (
                        <tr key={u._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {u.fatherName && <span className="block">Father: {u.fatherName}</span>}
                            {u.phoneNumber && <span className="block">Ph: {u.phoneNumber}</span>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { setFormData(u); setActiveMenu("pending-assign"); }}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
                            >
                              Approve & Assign Class
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* APPROVE FORM */}
          {activeMenu === "pending-assign" && (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <BackBtn to="pending" />
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-lg">
                <h5 className="font-bold text-xl text-slate-800 mb-6 border-b pb-4">Approve Admission: {formData.name}</h5>

                <div className="mb-6 bg-slate-50 p-4 rounded-lg text-sm text-slate-600 grid grid-cols-2 gap-4">
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Phone:</strong> {formData.phoneNumber}</div>
                  <div><strong>Father:</strong> {formData.fatherName}</div>
                  <div><strong>Address:</strong> {formData.address}</div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  apiAction('put', `/api/admin/approve/${formData._id}`, formData, "Student Approved & SRN Generated", "pending");
                }} className="space-y-6">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Class</label>
                    <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 bg-white" name="classId" onChange={handleInputChange} required>
                      <option value="">Select Class...</option>
                      {data.classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}
                    </select>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg text-xs text-yellow-800 flex items-start">
                    <FaMagic className="mr-2 mt-0.5" />
                    <p>Approving this student will automatically generate their <b>SRN (Student Registration Number)</b> and activate their account access.</p>
                  </div>

                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:-translate-y-0.5">
                    Confirm Approval
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* BULK UPLOAD */}
          {activeMenu === "bulk" && <AdminBulkUpload />}

          {/* DYNAMIC FORMS (CREATE/EDIT) */}
          {((activeMenu.includes("-create") && activeMenu !== "fees-create") || activeMenu.includes("-edit") || activeMenu.includes("-assign")) && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <BackBtn to={activeMenu.split("-")[0]} />

              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <h5 className="font-bold text-xl text-slate-800 mb-8 pb-4 border-b border-slate-100 uppercase tracking-wide">
                  {activeMenu.replace("-", " ")}
                </h5>

                {activeMenu.includes("users") && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const isEdit = activeMenu.includes("edit");
                    apiAction(
                      isEdit ? "put" : "post",
                      isEdit ? `/api/admin/users/${formData._id}` : "/api/admin/users",
                      formData,
                      "Account Updated",
                      "users"
                    );
                  }} className="space-y-8">

                    {/* Creds */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                      <h6 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Account Essentials</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                          <input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="name" value={formData.name || ""} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                          <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="email" value={formData.email || ""} onChange={handleInputChange} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                          <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" name="role" value={formData.role || "teacher"} onChange={handleInputChange}>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                            {/* Allow Student role only if editing an existing student */}
                            {(activeMenu.includes("edit") || activeMenu === "users-create") && (
                              <option value="student" disabled={activeMenu === "users-create"}>Student {activeMenu === "users-create" ? "(Use Admission)" : ""}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                    {/* Password Field for New Users */}
                    {activeMenu === "users-create" && (
                      <div className="mt-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          name="password"
                          placeholder="Set initial password"
                          value={formData.password || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    )}

                    {/* Admin Password Reset Override */}
                    {activeMenu.includes("edit") && (
                      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                        <h6 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center"><FaLock className="mr-2" /> Security Override</h6>
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reset Password</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-red-500"
                              placeholder="Enter new password"
                              value={formData.resetPassword || ""}
                              onChange={(e) => setFormData({ ...formData, resetPassword: e.target.value })}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!formData.resetPassword) return addToast("Enter a new password", "warning");
                              apiAction('put', `/api/admin/reset-password/${formData._id}`, { password: formData.resetPassword }, "Password Reset Successfully", null);
                              setFormData({ ...formData, resetPassword: "" });
                            }}
                            className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Student Extended Profile */}
                    {formData.role === "student" && (
                      <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                        <h6 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Student Profile</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Admission ID</label>
                            <input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="admissionId" value={formData.admissionId || ""} onChange={handleInputChange} placeholder="ADM-001" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                            <input type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="rollNumber" value={formData.rollNumber || ""} onChange={handleInputChange} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                            <input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="dob" value={formData.dob ? formData.dob.split('T')[0] : ""} onChange={handleInputChange} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div><label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="fatherName" value={formData.fatherName || ""} onChange={handleInputChange} /></div>
                          <div><label className="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="motherName" value={formData.motherName || ""} onChange={handleInputChange} /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                            <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleInputChange}>
                              <option value="">Select...</option>
                              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInputChange} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                          <textarea className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500" name="address" rows="2" value={formData.address || ""} onChange={handleInputChange}></textarea>
                        </div>
                      </div>
                    )}

                    <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                      {activeMenu.includes("edit") ? "Save Changes" : "Create Account"}
                    </button>
                  </form>
                )}

                {activeMenu === "classes-create" && (
                  <form onSubmit={(e) => { e.preventDefault(); apiAction('post', '/api/classes', formData, "Class Created", "classes") }} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="name" placeholder="e.g. 10" onChange={handleInputChange} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Section</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="section" placeholder="e.g. A" onChange={handleInputChange} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Academic Year</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="academicYear" placeholder="2024-25" onChange={handleInputChange} required /></div>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">Create Class</button>
                  </form>
                )}

                {activeMenu === "classes-assign" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                        name="classId"
                        onChange={handleInputChange}
                        value={formData.classId || ""}
                      >
                        <option value="">Choose Class...</option>
                        {data.classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}
                      </select>
                    </div>

                    <div className="border rounded-lg overflow-hidden border-slate-200">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <h6 className="font-bold text-slate-700">Select Students to Assign</h6>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, selectedStudents: data.users.filter(u => u.role === 'student').map(u => u._id) }));
                              } else {
                                setFormData(prev => ({ ...prev, selectedStudents: [] }));
                              }
                            }}
                            checked={data.users.filter(u => u.role === 'student').length > 0 && formData.selectedStudents?.length === data.users.filter(u => u.role === 'student').length}
                          />
                          <span className="text-sm font-semibold text-slate-600">Select All</span>
                        </label>
                      </div>
                      <div className="max-h-96 overflow-y-auto bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 w-10"></th>
                              <th className="px-4 py-2 text-slate-500 font-semibold">Name</th>
                              <th className="px-4 py-2 text-slate-500 font-semibold">SRN</th>
                              <th className="px-4 py-2 text-slate-500 font-semibold">Current Class</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.users.filter(u => u.role === 'student').map(s => (
                              <tr key={s._id} className={`hover:bg-slate-50 transition-colors ${formData.selectedStudents?.includes(s._id) ? "bg-blue-50/50" : ""}`}>
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    checked={formData.selectedStudents?.includes(s._id) || false}
                                    onChange={(e) => {
                                      const selected = formData.selectedStudents || [];
                                      if (e.target.checked) {
                                        setFormData(prev => ({ ...prev, selectedStudents: [...selected, s._id] }));
                                      } else {
                                        setFormData(prev => ({ ...prev, selectedStudents: selected.filter(id => id !== s._id) }));
                                      }
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700">{s.name}</td>
                                <td className="px-4 py-3 font-mono text-slate-500">{s.admissionId || "N/A"}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${s.classId ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {s.classId?.name ? `${s.classId.name}-${s.classId.section}` : "Unassigned"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!formData.classId) return addToast("Select a class first", "warning");
                        if (!formData.selectedStudents?.length) return addToast("Select at least one student", "warning");
                        apiAction('post', '/api/classes/bulk-assign', { classId: formData.classId, studentIds: formData.selectedStudents }, `Successfully assigned ${formData.selectedStudents.length} students.`, "classes");
                        setFormData(prev => ({ ...prev, selectedStudents: [] })); // Clear selection
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      <FaUsers /> Assign {formData.selectedStudents?.length || 0} Students to Class
                    </button>
                  </div>
                )}

                {activeMenu === "fees-assign" && <AdminAssignFee />}

                {activeMenu === "exams-create" && (
                  <form onSubmit={(e) => { e.preventDefault(); apiAction('post', '/api/exams', formData, "Exam Created", "exams") }} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Exam Name</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="name" placeholder="Mid Term" onChange={handleInputChange} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Subject</label><input className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="subject" onChange={handleInputChange} required /></div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white" name="classId" onChange={handleInputChange} required>
                        <option value="">Select Class...</option>
                        {data.classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Date</label><input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="examDate" onChange={handleInputChange} required /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Total Marks</label><input type="number" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" name="totalMarks" onChange={handleInputChange} required /></div>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg mt-4">Schedule Exam</button>
                  </form>
                )}

              </div>
            </div>
          )}



        </main>
      </div >

      {/* Global Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div >
  );
}

export default AdminDashboard;
