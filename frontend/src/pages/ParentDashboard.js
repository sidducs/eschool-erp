import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
    FaUserGraduate, FaChartPie, FaFileInvoiceDollar, FaSchool, FaChild,
    FaSignOutAlt, FaCalendarAlt, FaClipboardCheck, FaBook, FaBars, FaTimes
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Reuse Student Components
import StudentAttendance from "./StudentAttendance";
import StudentTimetable from "./StudentTimetable";
import StudentResults from "./StudentResults";

function ParentDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await api.get("/api/parent/children");
                setChildren(res.data);
                if (res.data.length > 0) setSelectedChild(res.data[0]);
            } catch (err) {
                console.error("Failed to load children", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const COLORS = ["#10B981", "#EF4444"]; // Green (Present), Red (Absent)

    if (loading) return <div className="p-10 text-center text-slate-500">Loading your dashboard...</div>;

    if (children.length === 0) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
            <FaChild size={48} className="mb-4 opacity-20" />
            <h2 className="text-2xl font-bold">No Students Linked</h2>
            <p>Please contact admin to link your child's SRN to your account.</p>
            <button onClick={logout} className="mt-6 text-red-500 hover:underline flex items-center gap-2">
                <FaSignOutAlt /> Logout
            </button>
        </div>
    );

    // Calculate Attendance Data for Chart
    const presentDays = selectedChild?.attendance?.filter(a => a.status === "Present").length || 0;
    const absentDays = selectedChild?.attendance?.filter(a => a.status === "Absent").length || 0;
    const attendanceData = [
        { name: "Present", value: presentDays },
        { name: "Absent", value: absentDays }
    ];

    const menus = [
        { id: "dashboard", label: "Overview", icon: FaChartPie },
        { id: "attendance", label: "Attendance", icon: FaClipboardCheck },
        { id: "timetable", label: "Class Timetable", icon: FaCalendarAlt },
        { id: "results", label: "Exam Results", icon: FaBook },
        { id: "fees", label: "Fee History", icon: FaFileInvoiceDollar },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Mobile Backdrop */}
            {showSidebar && window.innerWidth < 1024 && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out transform lg:relative lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 p-6 bg-slate-950/50 sidebar-header">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 p-1.5 rounded-lg"><FaSchool className="text-white" /></div>
                        <span className="font-bold text-lg tracking-wider">PARENT PORTAL</span>
                    </div>
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setShowSidebar(false)}>
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Child Selector in Sidebar */}
                <div className="px-4 py-4 border-b border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Viewing Student</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => {
                            setSelectedChild(children.find(c => c._id === e.target.value));
                            setActiveMenu("dashboard"); // Reset to dashboard on switch
                        }}
                        value={selectedChild?._id}
                    >
                        {children.map(child => (
                            <option key={child._id} value={child._id}>{child.name}</option>
                        ))}
                    </select>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-10rem)]">
                    {menus.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveMenu(item.id);
                                if (window.innerWidth < 1024) setShowSidebar(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeMenu === item.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className={`text-lg ${activeMenu === item.id ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{user?.name}</p>
                            <p className="text-xs text-slate-500">Parent Account</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold py-2 hover:bg-red-900/20 rounded-lg transition-colors">
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-slate-200 z-10">
                    <div className="flex items-center">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 lg:hidden">
                            <FaBars className="text-slate-600" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800">{menus.find(m => m.id === activeMenu)?.label}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                {user?.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-600">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold text-sm transition-colors py-1.5 px-3 rounded-lg hover:bg-red-50"
                            title="Sign Out"
                        >
                            <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
                    {selectedChild && (
                        <div className="animate-fadeIn w-full max-w-7xl mx-auto">

                            {/* Dashboard Overview */}
                            {activeMenu === "dashboard" && (
                                <div className="space-y-6">
                                    {/* Profile Header Card */}
                                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg flex-shrink-0 overflow-hidden">
                                            <img
                                                src={
                                                    selectedChild.profilePicture
                                                        ? (selectedChild.profilePicture.startsWith("http") ? selectedChild.profilePicture : `http://localhost:5000${selectedChild.profilePicture}`)
                                                        : "https://via.placeholder.com/150"
                                                }
                                                alt={selectedChild.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h2 className="text-3xl font-bold text-slate-800">{selectedChild.name}</h2>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                                    Class {selectedChild.classId?.name}-{selectedChild.classId?.section}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                                    SRN: {selectedChild.admissionId}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <FaClipboardCheck className="text-emerald-500" /> Attendance Overview
                                            </h3>
                                            <div className="h-48 flex items-center justify-center">
                                                {presentDays + absentDays > 0 ? (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie data={attendanceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                                {attendanceData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                ) : <p className="text-slate-400 italic">No attendance data yet</p>}
                                            </div>
                                            <div className="flex justify-center gap-6 mt-4">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Present: {presentDays}</div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-red-500"></span> Absent: {absentDays}</div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <FaFileInvoiceDollar className="text-blue-500" /> Recent Results
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedChild.examResults && selectedChild.examResults.length > 0 ? (
                                                    selectedChild.examResults.slice(0, 3).map((res, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                            <span className="font-bold text-slate-700">{res.examName || "Test"}</span>
                                                            <span className="font-bold text-blue-600">{res.marksObtained}/{res.totalMarks}</span>
                                                        </div>
                                                    ))
                                                ) : <div className="text-center py-10 text-slate-400 italic">No exam results published yet.</div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "attendance" && (
                                <StudentAttendance studentId={selectedChild._id} />
                            )}

                            {activeMenu === "timetable" && (
                                <StudentTimetable classId={selectedChild.classId?._id || selectedChild.classId} />
                            )}

                            {activeMenu === "results" && (
                                <StudentResults studentId={selectedChild._id} />
                            )}

                            {activeMenu === "fees" && (
                                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaFileInvoiceDollar size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700">Fee History Module</h3>
                                    <p className="text-slate-500">Detailed fee history and payment portal coming soon in next update.</p>
                                </div>
                            )}

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default ParentDashboard;
