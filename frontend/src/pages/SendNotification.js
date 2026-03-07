import { useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaPaperPlane, FaUsers, FaUserGraduate, FaChalkboardTeacher, FaUserTie } from "react-icons/fa";

function SendNotification() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: "all", // all, student, teacher, parent
        subject: "",
        message: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/api/notifications/send", formData);
            addToast(res.data.message, "success");
            setFormData({ role: "all", subject: "", message: "" });
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to send notification", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h5 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2">
                    <FaPaperPlane className="text-blue-600" /> Send Notification
                </h5>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 text-sm text-blue-800">
                    <p><strong>Note:</strong> This will send emails to users based on the selected role.</p>
                    <p>Parents are notified via their registered email addresses (if available) or student emails.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Recipient Group</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: "all", label: "Everyone", icon: FaUsers },
                                    { id: "student", label: "Students", icon: FaUserGraduate },
                                    { id: "teacher", label: "Teachers", icon: FaChalkboardTeacher },
                                    { id: "parent", label: "Parents", icon: FaUserTie }
                                ].map((role) => (
                                    <div
                                        key={role.id}
                                        onClick={() => setFormData({ ...formData, role: role.id })}
                                        className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${formData.role === role.id
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                            }`}
                                    >
                                        <role.icon />
                                        <span className="font-medium text-sm">{role.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                placeholder="e.g. School Holiday Notice"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message Content</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow h-40 resize-none"
                            placeholder="Type your message here..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2 ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                                }`}
                        >
                            {loading ? "Sending..." : <><FaPaperPlane /> Send Notification</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SendNotification;
