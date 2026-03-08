import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import Loader from "../components/Loader";
import { FaUser, FaLock, FaSave, FaCamera, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTimes } from "react-icons/fa";

function Profile() {
    const { user } = useContext(AuthContext);
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState("details"); // details | security
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profileData, setProfileData] = useState({});
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const fileInputRef = useRef(null);

    useEffect(() => {
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
        fetchProfile();
    }, [addToast]);

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
                if (profileData[key] !== null && profileData[key] !== undefined && key !== "profilePicture" && key !== "documents" && key !== "classId") {
                    formData.append(key, profileData[key]);
                }
            });

            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }

            const res = await api.put("/api/auth/profile", formData);

            setProfileData(prev => ({ ...prev, ...res.data.user }));
            setPreviewImage(null);
            setSelectedFile(null);
            setIsEditing(false); // Exit edit mode
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col sm:flex-row items-end -mt-12 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 bg-white p-1 rounded-full shadow-lg overflow-hidden">
                                    {previewImage || profileData.profilePicture ? (
                                        <img
                                            src={
                                                previewImage ||
                                                (profileData.profilePicture?.startsWith("http")
                                                    ? profileData.profilePicture
                                                    : profileData.profilePicture)
                                            }
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
                                {isEditing && (
                                    <>
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
                                    </>
                                )}
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-4 flex-1 text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-slate-800">{profileData.name || user?.name}</h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide border border-slate-200">
                                        {user?.role}
                                    </span>
                                    {profileData.admissionId && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                            SRN: {profileData.admissionId}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Edit/Cancel Toggle */}
                            {activeTab === "details" && (
                                <div className="mt-4 sm:mt-0">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            <FaEdit /> Edit Details
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { setIsEditing(false); setPreviewImage(null); setSelectedFile(null); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    )}
                                </div>
                            )}
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
                        <>
                            {!isEditing ? (
                                /* --- READ ONLY VIEW --- */
                                <div className="space-y-8 text-sm">

                                    {/* Academic Details - Only for students - MOVED TO TOP */}
                                    {user?.role === 'student' && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Academic Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">SRN / Admission ID</p>
                                                    <p className="font-semibold text-slate-800 text-base">{profileData.admissionId || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">Class & Section</p>
                                                    <p className="font-semibold text-slate-800 text-base">
                                                        {profileData.classId ? `${profileData.classId.name} - ${profileData.classId.section}` : "Not Assigned"}
                                                    </p>
                                                </div>
                                                {/* Roll Number Removed as per request */}
                                            </div>
                                        </div>
                                    )}

                                    {/* Personal Details Section */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-12"> {/* Reduced gap-y for tighter spacing if needed */}
                                            <div className="mb-5">
                                                <p className="text-slate-500 text-xs mb-1">Full Name</p>
                                                <p className="font-semibold text-slate-800 text-base">{profileData.name}</p>
                                            </div>
                                            <div className="mb-5">
                                                <p className="text-slate-500 text-xs mb-1">Email ID</p>
                                                <p className="font-semibold text-slate-800 text-base">{profileData.email}</p>
                                            </div>
                                            <div className="mb-5">
                                                <p className="text-slate-500 text-xs mb-1">Contact No</p>
                                                <p className="font-semibold text-slate-800 text-base">{profileData.phoneNumber || "N/A"}</p>
                                            </div>
                                            <div className="mb-5">
                                                <p className="text-slate-500 text-xs mb-1">Date of Birth</p>
                                                <p className="font-semibold text-slate-800 text-base">
                                                    {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : "N/A"}
                                                </p>
                                            </div>
                                            <div className="mb-5">
                                                <p className="text-slate-500 text-xs mb-1">Blood Group</p>
                                                <p className="font-semibold text-slate-800 text-base">{profileData.bloodGroup || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent Details - Only for students */}
                                    {user?.role === 'student' && (
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Parent Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">Father's Name</p>
                                                    <p className="font-semibold text-slate-800 text-base">{profileData.fatherName || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">Mother's Name</p>
                                                    <p className="font-semibold text-slate-800 text-base">{profileData.motherName || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Address */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Address Information</h3>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-1">Residential Address</p>
                                            <p className="font-semibold text-slate-800 text-base leading-relaxed">
                                                {profileData.address || "No address provided"}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                /* --- EDIT FORM --- */
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800">Edit Information</h3>
                                    </div>

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
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                                            <select
                                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                                value={profileData.bloodGroup || ""}
                                                onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                                            >
                                                <option value="">Select</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
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

                                    <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setIsEditing(false); setPreviewImage(null); }}
                                            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
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
                        </>
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
