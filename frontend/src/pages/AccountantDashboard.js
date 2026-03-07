import { useState, useContext, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
    FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaUserTie,
    FaSignOutAlt, FaBars, FaTimes, FaWallet, FaHandHoldingUsd
} from "react-icons/fa";
import Loader from "../components/Loader";
import PayrollManagement from "./PayrollManagement";
import FeeManager from "./FeeManager";

function AccountantDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);

    // Data States
    const [stats, setStats] = useState({
        collectedFees: 0,
        totalExpenses: 0,
        pendingFees: 0,
        netBalance: 0
    });
    const [expenses, setExpenses] = useState([]);

    // Forms
    const [expenseForm, setExpenseForm] = useState({ title: "", amount: "", category: "Maintenance", description: "" });

    useEffect(() => {
        fetchDashboardData();

        const handleResize = () => {
            if (window.innerWidth > 1024) setShowSidebar(true);
            else setShowSidebar(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, expensesRes] = await Promise.all([
                api.get("/api/finance/stats"),
                api.get("/api/finance/expenses")
            ]);
            setStats(statsRes.data);
            setExpenses(expensesRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load finance data", err);
            // Don't block loading on error, just show empty data or defaults
            setLoading(false);
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/finance/expenses", expenseForm);
            addToast("Expense recorded successfully", "success");
            setExpenseForm({ title: "", amount: "", category: "Maintenance", description: "" });
            fetchDashboardData(); // Refresh list
        } catch (err) {
            addToast("Failed to record expense", "error");
        }
    };

    const menuItems = [
        { id: "dashboard", label: "Financial Overview", icon: FaChartLine },
        { id: "fees", label: "Fee Collection", icon: FaMoneyBillWave },
        { id: "expenses", label: "Expense Tracker", icon: FaWallet },
        { id: "payroll", label: "Staff Payroll", icon: FaUserTie },
        { id: "reports", label: "Financial Reports", icon: FaFileInvoiceDollar },
    ];

    if (loading) return <Loader text="Loading Finance Portal..." />;

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
                        <div className="bg-green-600 p-1.5 rounded-lg">
                            <FaHandHoldingUsd className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Finance Portal</span>
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
                                if (window.innerWidth < 1024) setShowSidebar(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeMenu === item.id
                                ? "bg-green-600 text-white shadow-lg shadow-green-900/50"
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
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-10">
                    <div className="flex items-center">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 lg:hidden">
                            <FaBars className="text-slate-600" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                            {menuItems.find(m => m.id === activeMenu)?.label || "Overview"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="font-bold text-sm text-slate-800">{user?.name}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Accountant</span>
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
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Collected Fees</p>
                                    <h3 className="text-2xl font-bold text-green-600">₹{stats.collectedFees.toLocaleString()}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Expenses</p>
                                    <h3 className="text-2xl font-bold text-red-600">₹{stats.totalExpenses.toLocaleString()}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Fees</p>
                                    <h3 className="text-2xl font-bold text-amber-500">₹{stats.pendingFees.toLocaleString()}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Net Balance</p>
                                    <h3 className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-slate-800" : "text-red-500"}`}>
                                        ₹{stats.netBalance.toLocaleString()}
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Expenses */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                                        Recent Expenses
                                        <button onClick={() => setActiveMenu("expenses")} className="text-xs text-blue-600 hover:underline">View All</button>
                                    </h4>
                                    <div className="space-y-3">
                                        {expenses.slice(0, 5).map(exp => (
                                            <div key={exp._id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-bold text-slate-700">{exp.title}</p>
                                                    <span className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()} • {exp.category}</span>
                                                </div>
                                                <span className="font-bold text-red-600">-₹{exp.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {expenses.length === 0 && <p className="text-slate-400 text-sm">No recent expenses.</p>}
                                    </div>
                                </div>

                                {/* Placeholder for Fee Chart/List */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-blue-50 p-4 rounded-full text-blue-600 mb-4"><FaChartLine size={30} /></div>
                                    <h4 className="font-bold text-slate-800 mb-2">Fee Analytics</h4>
                                    <p className="text-slate-500 text-sm">Detailed fee collection reports and analytics will appear here.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMenu === "fees" && (
                        <div className="animate-fadeIn">
                            <FeeManager />
                        </div>
                    )}

                    {activeMenu === "payroll" && (
                        <div className="animate-fadeIn">
                            <PayrollManagement />
                        </div>
                    )}

                    {activeMenu === "expenses" && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4">Record New Expense</h4>
                                <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                    <div className="col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                        <input className="w-full border rounded p-2 text-sm" value={expenseForm.title} onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })} required />
                                    </div>
                                    <div className="col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                                        <input type="number" className="w-full border rounded p-2 text-sm" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                                    </div>
                                    <div className="col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                                        <select className="w-full border rounded p-2 text-sm" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                                            <option>Maintenance</option>
                                            <option>Utilities</option>
                                            <option>Events</option>
                                            <option>Salaries</option>
                                            <option>Supplies</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 lg:col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                        <input className="w-full border rounded p-2 text-sm" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                                    </div>
                                    <button type="submit" className="bg-red-600 text-white font-bold py-2 rounded shadow hover:bg-red-700">Add Expense</button>
                                </form>
                            </div>

                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-4 font-bold text-slate-600">Date</th>
                                            <th className="p-4 font-bold text-slate-600">Title</th>
                                            <th className="p-4 font-bold text-slate-600">Category</th>
                                            <th className="p-4 font-bold text-slate-600">Description</th>
                                            <th className="p-4 font-bold text-slate-600 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {expenses.map(exp => (
                                            <tr key={exp._id} className="hover:bg-slate-50">
                                                <td className="p-4 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-slate-800">{exp.title}</td>
                                                <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{exp.category}</span></td>
                                                <td className="p-4 text-slate-500">{exp.description}</td>
                                                <td className="p-4 font-bold text-red-600 text-right">-₹{exp.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        {expenses.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-slate-400 italic">No expenses recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeMenu === "reports" && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-800">Financial Performance Reports</h4>
                                    <p className="text-sm text-slate-500">Download and view analytical data for various fiscal heads.</p>
                                </div>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30">Generate Full Report</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { title: "Monthly Fee Collection", desc: "Consolidated list of received fees this month", icon: "📊" },
                                    { title: "Expense Analysis", desc: "Breakdown of school expenditures vs budget", icon: "📉" },
                                    { title: "Balance Sheet", desc: "Current financial standing and net liquidity", icon: "📑" },
                                    { title: "Tax & Compliance", desc: "Statutory filings and tax estimates", icon: "⚖️" }
                                ].map((rep, i) => (
                                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl bg-slate-50 p-3 rounded-xl group-hover:bg-blue-50 transition-colors">{rep.icon}</div>
                                            <div>
                                                <h5 className="font-bold text-slate-700">{rep.title}</h5>
                                                <p className="text-xs text-slate-500">{rep.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <FaFileInvoiceDollar size={40} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium italic">Advanced SQL aggregation logic for real-time reporting is scheduled for the next update.</p>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

export default AccountantDashboard;
