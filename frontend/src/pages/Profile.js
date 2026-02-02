import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import Loader from "../components/Loader";
import { FaUser, FaLock, FaSave, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function Profile() {
    const { user, login } = useContext(AuthContext);
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("details"); // details | security
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({});
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/api/auth/profile");
            setProfileData(res.data);
        } catch (err) {
            addToast("Failed to load profile", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== null && profileData[key] !== undefined && key !== "profilePicture" && key !== "documents") {
                    formData.append(key, profileData[key]);
                }
            });

            // Handle documents separation if needed, but for now just basic fields
            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }

            const res = await api.put("/api/auth/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setProfileData(res.data.user || profileData);
            login(res.data.user.token, res.data.user); // Refresh context user if needed, though backend currently returns user obj
            addToast("Profile updated successfully", "success");

        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || "Update Failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return addToast("New passwords do not match", "warning");
        }
        setSaving(true);
        try {
            await api.put("/api/auth/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            addToast("Password changed successfully", "success");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            addToast(err.response?.data?.message || "Password Change Failed", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader text="Loading Profile..." />;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row items-end -mt-12 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg overflow-hidden">
                                    {previewImage || profileData.profilePicture ? (
                                        <img
                                            src={previewImage || `http://localhost:5000${profileData.profilePicture}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-full border-2 border-white"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=USER"; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-3xl font-bold border-2 border-white uppercase">
                                            {user?.name?.charAt(0) || "U"}
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                                    title="Change Profile Photo"
                                >
                                    <FaCamera size={14} />
                                </button>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-slate-800">{user?.name}</h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide border border-slate-200">
                                        {user?.role}
                                    </span>
                                    <span className="text-slate-400 text-sm">•</span>
                                    <span className="text-slate-500 text-sm">{user?.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-6 border-b border-slate-200">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "details" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <FaUser className="inline mr-2" /> Personal Details
                                {activeTab === "details" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === "security" ? "text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <FaLock className="inline mr-2" /> Security & Password
                                {activeTab === "security" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fadeIn">

                    {activeTab === "details" && (
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all bg-slate-50"
                                        value={profileData.name || ""}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-xs text-slate-400">(Read Only)</span></label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                                            value={profileData.email || ""}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Additional Fields for Students/Teachers */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <FaPhone className="absolute left-3 top-3 text-slate-400" />
                                        <input
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                            value={profileData.phoneNumber || ""}
                                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Residential Address</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-3 top-3 text-slate-400" />
                                        <textarea
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                            value={profileData.address || ""}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            rows="3"
                                        />
                                    </div>
                                </div>

                                {user?.role === 'student' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                value={profileData.fatherName || ""}
                                                onChange={(e) => setProfileData({ ...profileData, fatherName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Mother's Name</label>
                                            <input
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                value={profileData.motherName || ""}
                                                onChange={(e) => setProfileData({ ...profileData, motherName: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center"
                                >
                                    {saving ? "Saving..." : <><FaSave className="mr-2" /> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === "security" && (
                        <form onSubmit={handlePasswordChange} className="max-w-md mx-auto space-y-6 py-4">
                            <h3 className="text-lg font-bold text-slate-800 text-center mb-6">Change Password</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute left-3 top-3 text-slate-400" />
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 transition-all"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center mt-6"
                            >
                                {saving ? "Updating..." : <><FaLock className="mr-2" /> Update Password</>}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div >
    );
}

export default Profile;
