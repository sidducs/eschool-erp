import { useState, useEffect } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaSearch, FaMoneyBillWave, FaCheckCircle, FaSpinner } from "react-icons/fa";

function FeeManager() {
    const { addToast } = useToast();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState(null);

    // Payment Form
    const [paymentData, setPaymentData] = useState({
        studentId: "",
        amount: ""
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const res = await api.get("/api/fees/student-fees");
            setStudents(res.data);
            setLoading(false);
        } catch (err) {
            addToast("Failed to load fee records", "error");
            setLoading(false);
        }
    };

    const handlePayment = async (studentId, currentPaid) => {
        const amount = prompt("Enter amount to pay:", "0");
        if (!amount || isNaN(amount)) return;

        setProcessingId(studentId);
        try {
            // Calculate new total paid
            const newPaid = Number(currentPaid) + Number(amount);

            await api.put("/api/fees/pay", {
                studentId,
                paidAmount: newPaid
            });

            addToast(`Payment of ₹${amount} recorded`, "success");
            fetchFees();
        } catch (err) {
            addToast("Failed to record payment", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredStudents = students.filter(s =>
        s.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId?.admissionId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center">Loading Fee Records...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <FaMoneyBillWave className="text-green-600" /> Fee Collection
                </h2>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-slate-400" />
                    <input
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Search Student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-green-50/50 border-b border-green-100">
                        <tr>
                            <th className="p-4 font-bold text-slate-600">ID</th>
                            <th className="p-4 font-bold text-slate-600">Student Name</th>
                            <th className="p-4 font-bold text-slate-600">Class</th>
                            <th className="p-4 font-bold text-slate-600">Total Fee</th>
                            <th className="p-4 font-bold text-slate-600 text-green-700">Paid</th>
                            <th className="p-4 font-bold text-slate-600 text-red-600">Pending</th>
                            <th className="p-4 font-bold text-slate-600">Status</th>
                            <th className="p-4 font-bold text-slate-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map(rec => {
                            const pending = rec.totalFee - rec.paidAmount;
                            return (
                                <tr key={rec._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono text-slate-500">{rec.studentId?.admissionId || "N/A"}</td>
                                    <td className="p-4 font-bold text-slate-800">{rec.studentId?.name}</td>
                                    <td className="p-4">{rec.classId?.name}</td>
                                    <td className="p-4">₹{rec.totalFee.toLocaleString()}</td>
                                    <td className="p-4 font-bold text-green-700">₹{rec.paidAmount.toLocaleString()}</td>
                                    <td className="p-4 font-bold text-red-600">₹{pending > 0 ? pending.toLocaleString() : 0}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${rec.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                            {rec.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handlePayment(rec.studentId._id, rec.paidAmount)}
                                            disabled={rec.status === "PAID" || processingId === rec.studentId._id}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${rec.status === "PAID" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"}`}
                                        >
                                            {processingId === rec.studentId._id ? <FaSpinner className="animate-spin" /> : "Collect Fee"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-slate-400 italic">No students found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FeeManager;
