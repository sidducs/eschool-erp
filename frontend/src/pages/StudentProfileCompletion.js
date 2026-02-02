import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { FaUserEdit, FaFileUpload, FaSave, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

function StudentProfileCompletion() {
    const { user, login } = useContext(AuthContext); // Re-login/refresh might be needed to update local user state if we store it
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fatherName: user?.fatherName || "",
        motherName: user?.motherName || "",
        dob: user?.dob ? user.dob.split('T')[0] : "",
        address: user?.address || "",
        phoneNumber: user?.phoneNumber || "",
        bloodGroup: user?.bloodGroup || "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Update Profile
            await api.put("/api/auth/profile", formData);
            addToast("Profile submitted! Please wait for Admin approval.", "success");

            // Optionally logout or just show a success "Pending Approval" state
            // For now, reload window to reflect any changes if beneficial, but 'pending' status won't change until Admin approves
            setTimeout(() => window.location.reload(), 2000);

        } catch (err) {
            addToast(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Complete Your Profile</h1>
                        <p className="text-sm text-slate-600">Your admission is <b>Pending Approval</b>. Please complete your details to proceed.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Father's Name</label>
                            <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Mother's Name</label>
                            <input name="motherName" value={formData.motherName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                                <option value="">Select...</option>
                                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Residential Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required ></textarea>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <FaCheckCircle className="text-blue-600 mt-1" />
                        <p className="text-sm text-blue-800">
                            Once you submit these details, your profile will be sent to the Administration for verification. You will be assigned a Class and SRN upon approval.
                        </p>
                    </div>

                    <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2">
                        {loading ? "Submitting..." : <><FaSave /> Submit for Approval</>}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default StudentProfileCompletion;
