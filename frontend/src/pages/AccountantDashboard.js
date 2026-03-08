import { useState, useContext, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import {
    FaChartLine, FaMoneyBillWave, FaFileInvoiceDollar, FaUserTie,
    FaSignOutAlt, FaBars, FaTimes, FaWallet, FaHandHoldingUsd, FaSun, FaMoon
} from "react-icons/fa";
import Loader from "../components/Loader";
import PayrollManagement from "./PayrollManagement";
import FeeManager from "./FeeManager";

function AccountantDashboard() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
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
    const [reportsData, setReportsData] = useState(null);

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
            const [statsRes, expensesRes, reportsRes] = await Promise.all([
                api.get("/api/finance/stats"),
                api.get("/api/finance/expenses"),
                api.get("/api/finance/reports")
            ]);
            setStats(statsRes.data);
            setExpenses(expensesRes.data);
            setReportsData(reportsRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load finance data", err);
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
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out transform lg:relative lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} dark:bg-black border-r dark:border-slate-800`}>
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950/50 sidebar-header">
                        <a href="https://eschool-erp.vercel.app/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <img src="/eschool-logo-new.png" alt="eSchool ERP" className="h-8 w-auto object-contain" />
                            <span className="font-bold text-lg tracking-tight text-white">eSchool <span className="text-blue-400">ERP</span></span>
                        </a>
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setShowSidebar(false)}>
                        <FaTimes size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveMenu(item.id);
                                if (window.innerWidth < 1024) setShowSidebar(false);
                            }}
                            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === item.id
                                ? "bg-blue-600 text-white shadow-lg"
                                : "text-slate-400 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            <item.icon className="text-lg" />
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
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-xs font-bold py-2 hover:bg-red-900/20 rounded-xl transition-all">
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden dark:bg-slate-900">
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-10 dark:bg-slate-950 dark:border-slate-800">
                    <div className="flex items-center">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="mr-4 p-2 rounded-full hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
                            <FaBars className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide dark:text-white">
                            {menuItems.find(m => m.id === activeMenu)?.label || "Overview"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{user?.name}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-400">Accountant</span>
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
                                <button
                                    onClick={() => addToast("Generating PDF Report...", "info")}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition"
                                >
                                    Generate Full Report
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-3xl bg-blue-50 p-3 rounded-xl text-blue-600">📊</div>
                                        <div>
                                            <h5 className="font-bold text-slate-700">Monthly Fee Collection</h5>
                                            <p className="text-xs text-slate-500">Collected in {new Date().toLocaleString('default', { month: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-700">₹{reportsData?.monthlyCollection?.toLocaleString() || 0}</div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-3xl bg-red-50 p-3 rounded-xl text-red-600">📉</div>
                                        <div>
                                            <h5 className="font-bold text-slate-700">Expense Analysis</h5>
                                            <p className="text-xs text-slate-500">Total expenditures by category</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {reportsData?.expenseAnalysis?.map((exp, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-slate-500 font-medium">{exp.category}</span>
                                                <span className="font-bold">₹{exp.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {(!reportsData?.expenseAnalysis || reportsData.expenseAnalysis.length === 0) && <p className="text-xs text-slate-400 italic">No expense data available</p>}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-3xl bg-green-50 p-3 rounded-xl text-green-600">📑</div>
                                        <div>
                                            <h5 className="font-bold text-slate-700">Balance Sheet</h5>
                                            <p className="text-xs text-slate-500">Assets vs Liabilities</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Assets</p>
                                            <p className="font-bold text-green-600">₹{reportsData?.balanceSheet?.totalAssets?.toLocaleString() || 0}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Liabilities</p>
                                            <p className="font-bold text-red-600">₹{reportsData?.balanceSheet?.totalLiabilities?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-600">Net Liquidity</span>
                                        <span className="text-lg font-black text-slate-800">₹{reportsData?.balanceSheet?.netLiquidity?.toLocaleString() || 0}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="text-3xl bg-amber-50 p-3 rounded-xl text-amber-600">⚖️</div>
                                        <div>
                                            <h5 className="font-bold text-slate-700">Tax & Compliance</h5>
                                            <p className="text-xs text-slate-500">Estimated statutory filings</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center h-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-slate-500">Est. Tax Payable (5%)</span>
                                            <span className="font-bold text-amber-700">₹{reportsData?.taxCompliance?.estimatedTax?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded w-fit uppercase">
                                            {reportsData?.taxCompliance?.status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                                <FaFileInvoiceDollar size={32} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 text-sm font-medium">Real-time financial summaries are generated using advanced database aggregation logic.</p>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}

export default AccountantDashboard;
