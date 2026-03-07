import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { FaSave, FaCheckCircle, FaExclamationTriangle, FaFileUpload, FaSignOutAlt } from "react-icons/fa";

function StudentProfileCompletion() {
    const { user, logout } = useContext(AuthContext); // Added logout
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    // Check if user has already submitted data (basic check on fatherName which is required)
    const isSubmitted = user?.fatherName && user?.status === "pending";

    const [formData, setFormData] = useState({
        fatherName: user?.fatherName || "",
        motherName: user?.motherName || "",
        dob: user?.dob ? user.dob.split('T')[0] : "",
        address: user?.address || "",
        phoneNumber: user?.phoneNumber || "",
        bloodGroup: user?.bloodGroup || "",
    });

    const [profilePic, setProfilePic] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePic(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (profilePic) {

                data.append("profilePicture", profilePic);
            } else {
                console.warn("No file selected in state!");
            }

            // Debug FormData
            for (let pair of data.entries()) {

            }

            // 1. Update Profile
            await api.put("/api/auth/profile", data);
            addToast("Profile submitted! Awaiting Admin Approval.", "success");

            // Reload to show the pending state
            setTimeout(() => window.location.reload(), 1500);

        } catch (err) {
            addToast(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaExclamationTriangle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Thank you for submitting your details. The administration is currently reviewing your application.
                        Once approved, you will be assigned a <b>Class</b> and <b>SRN</b>, and you will gain full access to the dashboard.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 text-sm text-slate-500">
                        <p>Student Name: <b>{user?.name}</b></p>
                        <p>Status: <span className="text-amber-600 font-bold uppercase tracking-wider">Pending Approval</span></p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
                    <div>
                        <h1 className="text-xl font-bold">Complete Your Profile</h1>
                        <p className="text-blue-100 text-sm">Please provide your details to proceed with admission.</p>
                    </div>
                    <button onClick={logout} className="text-blue-200 hover:text-white transition-colors">
                        <FaSignOutAlt size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mb-2 overflow-hidden relative">
                            {profilePic ? (
                                <img src={URL.createObjectURL(profilePic)} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <FaFileUpload className="text-slate-400 text-2xl" />
                            )}
                        </div>
                        <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">
                            Upload Photo
                            <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </label>
                    </div>

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
