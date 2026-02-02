import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext"; // Import Global Toast
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import {
  FaTachometerAlt, FaUsers, FaMoneyBillWave, FaChalkboardTeacher,
  FaClipboardCheck, FaBook, FaUpload, FaBullhorn,
  FaUserGraduate, FaUserTie, FaBars, FaArrowLeft, FaEdit, FaTrash, FaPaperPlane,
  FaSearch, FaPrint, FaBookReader, FaTimes, FaUserPlus, FaCogs, FaMagic, FaUserCheck, FaLock
} from "react-icons/fa";

import LibraryDashboard from "./LibraryDashboard";
import AdminAdmission from "./AdminAdmission";
import AdminCreateFeeStructure from "./AdminCreateFeeStructure";
import AdminSettings from "./AdminSettings";
import AdminTimetable from "./AdminTimetable";


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AdminDashboard() {
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
          api.get("/api/fees/student-fees"), api.get("/api/exams"), api.get("/api/notices")
        ]);
        setData({
          users: results[0].status === 'fulfilled' ? results[0].value.data : [],
          classes: results[1].status === 'fulfilled' ? results[1].value.data : [],
          stats: results[2].status === 'fulfilled' ? results[2].value.data : {},
          fees: results[3].status === 'fulfilled' ? results[3].value.data : [],
          exams: results[4].status === 'fulfilled' ? results[4].value.data : [],
          notices: results[5].status === 'fulfilled' ? results[5].value.data : []
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
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value || 0}</h3>
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
    { id: "pending", label: "Pending Approvals", icon: FaUserCheck }, // New Menu
    { id: "users", label: "User Management", icon: FaUsers },
    { id: "classes", label: "Academics", icon: FaChalkboardTeacher },
    { id: "fees", label: "Finance & Fees", icon: FaMoneyBillWave },
    { id: "library", label: "Library Hub", icon: FaBookReader },
    { id: "exams", label: "Examinations", icon: FaBook },
    { id: "timetable", label: "Timetable", icon: FaClipboardCheck },
    { id: "notices", label: "Notice Board", icon: FaBullhorn },
    { id: "bulk", label: "Bulk Upload", icon: FaUpload },
    { id: "settings", label: "Settings", icon: FaCogs },
  ];

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
            <span className="font-bold text-lg tracking-tight">ESchool ERP</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setShowSidebar(false)}>
            <FaTimes size={20} />
          </button>
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
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 lg:hidden">
              <FaBars className="text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
              {activeMenu.split("-")[0].replace("users", "User Management").replace("classes", "Academic Classes")}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-bold text-sm text-slate-800">{user?.name || "Administrator"}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Admin</span>
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
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-700 mb-6">Attendance Overview</h4>
                  <div className="h-64 relative">
                    <Doughnut data={chartData.att} options={{ maintainAspectRatio: false, cutout: '70%' }} />
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-700 mb-6">Financial Overview</h4>
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
                  <table className="w-full text-left border-collapse">
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
                              onClick={() => apiAction('delete', `/api/admin/users/${u._id}`, null, "User deleted successfully", null)}
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
                  <table className="w-full text-left">
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
                <table className="w-full text-left">
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
                                className="px-3 py-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200 transition-colors"
                                onClick={() => {
                                  const amt = paymentInputs[f.studentId?._id];
                                  if (!amt) return addToast("Enter amount", "warning");
                                  apiAction('put', '/api/fees/pay', { studentId: f.studentId._id, paidAmount: Number(amt) }, "Payment Recorded", null);
                                  setPaymentInputs({ ...paymentInputs, [f.studentId?._id]: "" });
                                }}
                              >
                                Pay
                              </button>
                            </div>
                          )}
                          <button
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            onClick={() => window.open(`/receipt/${f._id}`, '_blank')}
                            title="View/Print Receipt"
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
                <table className="w-full text-left">
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
          {activeMenu === "bulk" && (
            <div className="flex justify-center items-center h-[60vh] animate-fadeIn">
              <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-lg text-center max-w-md w-full">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUpload size={32} className="text-slate-400" />
                </div>
                <h5 className="font-bold text-xl text-slate-800 mb-2">Bulk Student Import</h5>
                <p className="text-slate-500 text-sm mb-8">Upload a CSV file to add students in bulk.</p>

                <form onSubmit={(e) => { e.preventDefault(); if (!formData.file) return addToast("No File Selected", "warning"); const d = new FormData(); d.append("file", formData.file); apiAction('post', '/api/bulk-upload/students', d, "Data Uploaded", null) }}>
                  <label className="block w-full cursor-pointer mb-4">
                    <span className="sr-only">Choose file</span>
                    <input type="file" className="block w-full text-sm text-slate-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100
                                " accept=".csv" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} required />
                  </label>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
                    Process CSV File
                  </button>
                </form>
              </div>
            </div>
          )}

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
                          <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" name="role" value={formData.role || "student"} onChange={handleInputChange}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>

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
                  <form onSubmit={(e) => { e.preventDefault(); apiAction('post', '/api/classes/assign-student', formData, "Student Assigned", "classes") }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white" name="studentId" onChange={handleInputChange} required>
                        <option value="">Choose Student...</option>
                        {data.users.filter(u => u.role === 'student').map(s => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.admissionId || "No SRN"})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white" name="classId" onChange={handleInputChange} required>
                        <option value="">Choose Class...</option>
                        {data.classes.map(c => <option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}
                      </select>
                    </div>

                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4">Assign Student</button>
                  </form>
                )}

                {activeMenu === "fees-assign" && (
                  <form onSubmit={(e) => { e.preventDefault(); apiAction('post', '/api/fees/assign', formData, "Fee Assigned", "fees") }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white" name="studentId" onChange={handleInputChange} required>
                        <option value="">Select...</option>
                        {(data.users || []).filter(u => u.role === 'student').map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4">Assign Fee</button>
                  </form>
                )}

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
    </div >
  );
}

export default AdminDashboard;
