import { useState, useEffect } from "react";
import api from "../services/api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { FaCheck, FaTimes, FaCalendarCheck, FaClock } from "react-icons/fa";

function AdminLeaves() {
    const { addToast } = useToast();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchLeaves();
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps // eslint-disable-next-line react-hooks/exhaustive-deps

    const fetchLeaves = async () => {
        try {
            const res = await api.get("/api/leaves/all");
            setLeaves(res.data);
        } catch (err) {
            addToast("Failed to fetch leave requests", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        setActionLoading(id);
        const comment = prompt(status === "Rejected" ? "Reason for rejection?" : "Add a comment (optional):");

        try {
            await api.put(`/api/leaves/${id}/status`, { status, adminComment: comment });
            addToast(`Leave request ${status.toLowerCase()} successfully`, "success");
            fetchLeaves();
        } catch (err) {
            addToast("Failed to update status", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const pendingLeaves = leaves.filter(l => l.status === "Pending");
    const historyLeaves = leaves.filter(l => l.status !== "Pending");

    if (loading) return <Loader text="Loading Requests..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FaCalendarCheck className="text-indigo-600" /> Leave Management
            </h1>

            {/* Pending Requests */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <FaClock className="text-orange-500" /> Pending Requests ({pendingLeaves.length})
                </h2>

                {pendingLeaves.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-slate-400">
                        No pending leave requests.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingLeaves.map((leave) => (
                            <div key={leave._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{leave.user?.name}</h3>
                                        <span className="text-xs text-slate-500">{leave.user?.admissionId || leave.user?.role}</span>
                                    </div>
                                    <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold uppercase">
                                        {leave.leaveType}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-2 mb-6">
                                    <div className="text-sm font-semibold text-slate-600">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </div>
                                    <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl italic">
                                        "{leave.reason}"
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                                        disabled={actionLoading === leave._id}
                                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(leave._id, "Approved")}
                                        disabled={actionLoading === leave._id}
                                        className="flex-1 bg-green-50 text-green-600 py-2 rounded-xl font-bold text-sm hover:bg-green-100 transition flex items-center justify-center gap-2"
                                    >
                                        <FaCheck /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700">Approval History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Student</th>
                                <th className="px-6 py-4 text-left">Type</th>
                                <th className="px-6 py-4 text-left">Dates</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Reviewer Comment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historyLeaves.map((leave) => (
                                <tr key={leave._id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-700">{leave.user?.name}</div>
                                        <div className="text-xs text-slate-400">{leave.user?.admissionId || "Staff"}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{leave.leaveType}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${leave.status === 'Approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 italic">
                                        {leave.adminComment || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminLeaves;
