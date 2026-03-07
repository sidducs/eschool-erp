import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaCalendarAlt, FaPlus, FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import Loader from "../components/Loader";

function StudentLeaves() {
    const { addToast } = useToast();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        leaveType: "Sick Leave",
        startDate: "",
        endDate: "",
        reason: ""
    });

    useEffect(() => {
        fetchMyLeaves();
    }, []);

    const fetchMyLeaves = async () => {
        try {
            const res = await api.get("/api/leaves/my-leaves");
            setLeaves(res.data);
        } catch (err) {
            addToast("Failed to fetch leave history", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/leaves/apply", formData);
            addToast("Leave application submitted!", "success");
            setShowForm(false);
            setFormData({ leaveType: "Sick Leave", startDate: "", endDate: "", reason: "" });
            fetchMyLeaves();
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to submit application", "error");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Approved": return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold"><FaCheckCircle /> Approved</span>;
            case "Rejected": return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold"><FaTimesCircle /> Rejected</span>;
            default: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold"><FaClock /> Pending</span>;
        }
    };

    if (loading) return <Loader text="Loading Leaves..." />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FaCalendarAlt className="text-indigo-600" /> Leave Applications
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <FaPlus /> {showForm ? "Cancel" : "Apply New Leave"}
                </button>
            </div>

            {/* Application Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-fade-in-down">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">New Leave Request</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 mb-1">Leave Type</label>
                                <select
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Sick Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Emergency</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 mb-1">Reason</label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows="3"
                                className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Please explain why you need leave..."
                            ></textarea>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* History List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        <FaHistory /> My Leave History
                    </h3>
                </div>

                {leaves.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">No leave applications found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Type</th>
                                    <th className="px-6 py-4 text-left">Dates</th>
                                    <th className="px-6 py-4 text-left">Reason</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-left">Applied On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4 font-semibold text-slate-700">{leave.leaveType}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 truncate max-w-xs">{leave.reason}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(leave.status)}
                                            {leave.adminComment && (
                                                <div className="text-xs text-slate-400 mt-1">Note: {leave.adminComment}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(leave.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentLeaves;
