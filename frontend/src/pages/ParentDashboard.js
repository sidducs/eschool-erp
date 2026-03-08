import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import {
    FaUserGraduate, FaChartPie, FaFileInvoiceDollar, FaSchool, FaChild,
    FaSignOutAlt, FaCalendarAlt, FaClipboardCheck, FaBook, FaBars, FaTimes,
    FaBullhorn, FaSun, FaMoon
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Reuse Student Components
import StudentAttendance from "./StudentAttendance";
import StudentTimetable from "./StudentTimetable";
import StudentResults from "./StudentResults";

function ParentDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);

    const [notices, setNotices] = useState([]);
    const [stats, setStats] = useState({ feeStatus: "Pending", unpaidAmount: 0 });

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

        const fetchGlobalNotices = async () => {
            try {
                const res = await api.get("/api/notices");
                setNotices(res.data);
            } catch (err) {
                console.error("Failed to load notices");
            }
        };
        fetchGlobalNotices();
    }, []);

    useEffect(() => {
        if (selectedChild) {
            fetchChildStats(selectedChild._id);
        }
    }, [selectedChild]);

    const fetchChildStats = async (studentId) => {
        try {
            const feeRes = await api.get(`/api/fees/my-fee?studentId=${studentId}`);
            if (feeRes.data) {
                setStats({
                    feeStatus: feeRes.data.status,
                    unpaidAmount: feeRes.data.totalFee - feeRes.data.paidAmount
                });
            }
        } catch (err) {
            console.error("Failed to fetch child stats");
        }
    };

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
        { id: "fees", label: "Fee Status", icon: FaFileInvoiceDollar },
        { id: "notices", label: "Notices", icon: FaBullhorn },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">

            {/* Mobile Backdrop */}
            {showSidebar && window.innerWidth < 1024 && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out transform lg:relative lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} dark:bg-black border-r dark:border-slate-800`}>
                <div className="flex items-center justify-between h-16 p-6 bg-slate-950/50 sidebar-header">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-500 p-1.5 rounded-lg"><FaSchool className="text-white" /></div>
                        <span className="font-bold text-lg tracking-wider italic">PARENT PORTAL</span>
                    </div>
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setShowSidebar(false)}>
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Child Selector in Sidebar */}
                <div className="px-4 py-4 border-b border-slate-800">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest font-sans">Viewing Student</label>
                    <select
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        onChange={(e) => {
                            const child = children.find(c => c._id === e.target.value);
                            setSelectedChild(child);
                            setActiveMenu("dashboard");
                        }}
                        value={selectedChild?._id}
                    >
                        {children.map(child => (
                            <option key={child._id} value={child._id}>{child.name}</option>
                        ))}
                    </select>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-14rem)] custom-scrollbar">
                    {menus.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveMenu(item.id);
                                if (window.innerWidth < 1024) setShowSidebar(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeMenu === item.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className={`text-lg ${activeMenu === item.id ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                        {theme === "dark" ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-400" />}
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>

                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm text-white">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Parent account</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-[10px] font-black py-2 hover:bg-red-900/20 rounded-xl transition-all uppercase tracking-widest border border-red-900/10">
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden dark:bg-slate-900">
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-slate-200 z-10 dark:bg-slate-950 dark:border-slate-800">
                    <div className="flex items-center">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 lg:hidden transition-colors dark:hover:bg-slate-800">
                            <FaBars className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight dark:text-white">{menus.find(m => m.id === activeMenu)?.label}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                {user?.name?.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-600 tracking-wide uppercase dark:text-slate-300">{user?.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-bold text-sm transition-all py-1.5 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
                            title="Sign Out"
                        >
                            <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
                    {selectedChild && (
                        <div className="animate-fadeIn w-full max-w-7xl mx-auto">

                            {/* Dashboard Overview */}
                            {activeMenu === "dashboard" && (
                                <div className="space-y-6">
                                    {/* Profile Header Card */}
                                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                        <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-lg flex-shrink-0 overflow-hidden group">
                                            <img
                                                src={
                                                    selectedChild.profilePicture
                                                        ? selectedChild.profilePicture
                                                        : "https://via.placeholder.com/150"
                                                }
                                                alt={selectedChild.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedChild.name}</h2>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase tracking-widest">
                                                    Class {selectedChild.classId?.name}-{selectedChild.classId?.section}
                                                </span>
                                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase tracking-widest">
                                                    SRN: {selectedChild.admissionId}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 px-6 py-4 rounded-3xl border border-emerald-100 text-center">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Fee Status</p>
                                            <p className={`text-lg font-black ${stats.feeStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-600'}`}>
                                                {stats.feeStatus}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                            <h3 className="text-md font-bold text-slate-700 mb-6 flex items-center gap-3">
                                                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><FaClipboardCheck /></div> Attendance Analytics
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
                                                ) : <p className="text-slate-400 italic text-sm">No attendance data yet</p>}
                                            </div>
                                            <div className="flex justify-center gap-8 mt-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-emerald-600">{presentDays}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-black text-red-500">{absentDays}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Absent</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                            <h3 className="text-md font-bold text-slate-700 mb-6 flex items-center gap-3">
                                                <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><FaFileInvoiceDollar /></div> Top Exam Scores
                                            </h3>
                                            <div className="space-y-3">
                                                {selectedChild.examResults && selectedChild.examResults.length > 0 ? (
                                                    selectedChild.examResults.slice(0, 4).map((res, idx) => (
                                                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-all">
                                                            <span className="font-bold text-slate-700 text-sm">{res.examName || "Test"}</span>
                                                            <span className="font-black text-blue-600 text-sm">{res.marksObtained}/{res.totalMarks}</span>
                                                        </div>
                                                    ))
                                                ) : <div className="text-center py-10 text-slate-400 italic text-sm">No exam results published yet.</div>}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                            <h3 className="text-md font-bold text-slate-700 mb-6 flex items-center gap-3">
                                                <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><FaBullhorn /></div> Latest Notices
                                            </h3>
                                            <div className="space-y-4">
                                                {notices.length === 0 ? (
                                                    <p className="text-center py-10 text-slate-400 italic text-sm">No active notices.</p>
                                                ) : (
                                                    notices.slice(0, 3).map((n, i) => (
                                                        <div key={i} className="border-l-4 border-amber-400 pl-4 py-1">
                                                            <h5 className="font-bold text-slate-800 text-sm truncate">{n.title}</h5>
                                                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{n.content}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "attendance" && <StudentAttendance studentId={selectedChild._id} />}

                            {activeMenu === "timetable" && <StudentTimetable classId={selectedChild.classId?._id || selectedChild.classId} />}

                            {activeMenu === "results" && <StudentResults studentId={selectedChild._id} />}

                            {activeMenu === "fees" && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
                                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <FaFileInvoiceDollar size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Child Fee Status</h3>
                                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Financial records for {selectedChild.name}. Please clear any outstanding dues via the school office.</p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                                                <p className={`text-2xl font-black ${stats.feeStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>{stats.feeStatus}</p>
                                            </div>
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Unpaid Balance</p>
                                                <p className="text-2xl font-black text-slate-800">₹{stats.unpaidAmount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeMenu === "notices" && (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 rounded-3xl text-white shadow-lg mb-8">
                                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3"><FaBullhorn /> School Announcements</h2>
                                        <p className="text-amber-100 mt-2 font-medium opacity-90">Keep track of the latest updates and schedules from the administration.</p>
                                    </div>
                                    {notices.map((n, i) => (
                                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all border-l-8 border-l-amber-400">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-lg font-black text-slate-800 tracking-tight">{n.title}</h4>
                                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                                                    {new Date(n.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed text-sm font-medium">{n.content}</p>
                                        </div>
                                    ))}
                                    {notices.length === 0 && (
                                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                            <FaBullhorn className="mx-auto text-slate-200 text-5xl mb-4" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">No notices published</p>
                                        </div>
                                    )}
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
