import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaUserTie, FaMoneyCheckAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

function PayrollManagement() {
    const { addToast } = useToast();
    const [staff, setStaff] = useState([]);
    const [payrollHistory, setPayrollHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        staffId: "",
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        salaryAmount: "",
        remarks: ""
    });

    useEffect(() => {
        fetchData();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

    const fetchData = async () => {
        try {
            const [staffRes, payrollRes] = await Promise.all([
                api.get("/api/users/teachers"), // Reusing teacher list, might need custom endpoint for all staff
                api.get("/api/finance/payroll")
            ]);
            setStaff(staffRes.data);
            setPayrollHistory(payrollRes.data);
            setLoading(false);
        } catch (err) {
            addToast("Failed to load payroll data", "error");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const res = await api.post("/api/finance/payroll", formData);
            setPayrollHistory([res.data, ...payrollHistory]);
            addToast("Payroll processed successfully", "success");
            setFormData({ ...formData, salaryAmount: "", remarks: "" });
        } catch (err) {
            addToast("Failed to process payroll", "error");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Payroll...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FaUserTie className="text-indigo-600" /> Staff Payroll
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Process Payroll Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1 h-fit">
                    <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">Process Salary</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Staff</label>
                            <select
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                value={formData.staffId}
                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                required
                            >
                                <option value="">Choose Staff Member...</option>
                                {staff.map(s => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month</label>
                            <input
                                className="w-full border rounded-lg p-2 text-sm"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                            <input
                                type="number"
                                className="w-full border rounded-lg p-2 text-sm"
                                value={formData.salaryAmount}
                                onChange={(e) => setFormData({ ...formData, salaryAmount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks</label>
                            <textarea
                                className="w-full border rounded-lg p-2 text-sm"
                                rows="2"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition shadow-md flex justify-center items-center gap-2"
                        >
                            {processing ? <FaSpinner className="animate-spin" /> : <FaMoneyCheckAlt />} Process Payment
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <h4 className="font-bold text-slate-700 mb-4">Payment History</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-3 font-bold text-slate-600">Date</th>
                                    <th className="p-3 font-bold text-slate-600">Staff</th>
                                    <th className="p-3 font-bold text-slate-600">Month</th>
                                    <th className="p-3 font-bold text-slate-600">Amount</th>
                                    <th className="p-3 font-bold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrollHistory.map(rec => (
                                    <tr key={rec._id} className="hover:bg-slate-50">
                                        <td className="p-3 text-slate-500">{new Date(rec.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 font-bold text-slate-800">{rec.staffId?.name || "Unknown"}</td>
                                        <td className="p-3">{rec.month}</td>
                                        <td className="p-3 font-mono font-bold">₹{rec.salaryAmount.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                                                <FaCheckCircle size={10} /> Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {payrollHistory.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-slate-400 italic">No payroll records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PayrollManagement;
