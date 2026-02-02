import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaUserPlus, FaUserTie, FaAddressCard, FaCalendarAlt, FaIdCard, FaPhone, FaTint, FaGraduationCap } from "react-icons/fa";
import { useToast } from "../context/ToastContext"; // Import Toast Hook

function AdminAdmission() {
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "", // User set password
        role: "student",
        fatherName: "",
        motherName: "",
        phoneNumber: "",
        dob: "",
        bloodGroup: "",
        address: "",
        classId: "",
        section: "A",
        rollNumber: ""
    });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get("/api/classes");
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to load classes");
            }
        };
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/admin/users", formData);
            addToast("✅ Student Admitted Successfully!", "success");
            // Reset critical fields
            setFormData({ ...formData, name: "", email: "", fatherName: "", motherName: "", phoneNumber: "", dob: "", admissionId: "", rollNumber: "" });
        } catch (err) {
            addToast("❌ Admission Failed: " + (err.response?.data?.message || err.message), "error");
        } finally {
            setLoading(false);
        }
    };

    const SectionTitle = ({ icon, title }) => (
        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider border-b border-blue-100 pb-2 mb-4 mt-6 first:mt-0">
            {icon} {title}
        </div>
    );

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                    <FaUserPlus size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Student Admission</h2>
                    <p className="text-slate-500 text-sm">Onboard new students with complete profile details.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN - Personal */}
                    <div className="lg:col-span-2 space-y-6">

                        <SectionTitle icon={<FaUserTie />} title="Student Essentials" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                                <input type="text" name="name" required className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Rahul Kumar" onChange={handleChange} value={formData.name} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Email (Login ID)</label>
                                <input type="email" name="email" required className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="student@school.com" onChange={handleChange} value={formData.email} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Set Password</label>
                                <input type="text" name="password" required className="w-full p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="Set login password" onChange={handleChange} value={formData.password} />
                            </div>
                        </div>

                        <SectionTitle icon={<FaAddressCard />} title="Parent & Contact Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Father's Name</label>
                                <input type="text" name="fatherName" required className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none" onChange={handleChange} value={formData.fatherName} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Mother's Name</label>
                                <input type="text" name="motherName" required className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none" onChange={handleChange} value={formData.motherName} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Contact Phone</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3 text-slate-400 text-xs" />
                                    <input type="tel" name="phoneNumber" required className="w-full pl-8 p-2.5 bg-slate-50 border rounded-lg outline-none" placeholder="9876543210" onChange={handleChange} value={formData.phoneNumber} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Residential Address</label>
                                <textarea name="address" rows="2" className="w-full p-2.5 bg-slate-50 border rounded-lg outline-none" placeholder="Flat No, Street, City..." onChange={handleChange} value={formData.address}></textarea>
                            </div>
                        </div>

                        <SectionTitle icon={<FaIdCard />} title="Biographical Info" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-slate-400 text-xs" />
                                    <input type="date" name="dob" className="w-full pl-8 p-2.5 bg-slate-50 border rounded-lg outline-none" onChange={handleChange} value={formData.dob} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Blood Group</label>
                                <div className="relative">
                                    <FaTint className="absolute left-3 top-3 text-slate-400 text-xs" />
                                    <select name="bloodGroup" className="w-full pl-8 p-2.5 bg-slate-50 border rounded-lg outline-none" onChange={handleChange} value={formData.bloodGroup}>
                                        <option value="">Select</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Academic */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 h-fit">
                        <SectionTitle icon={<FaGraduationCap />} title="Academic Assignment" />

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Student Registration Number (SRN)</label>
                                <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 italic text-sm">
                                    Auto-generated by System
                                </div>
                                <p className="text-[10px] text-blue-500 mt-1 font-bold">Format configured in Admin Settings</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Assign Class</label>
                                <select name="classId" required className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none" onChange={handleChange} value={formData.classId}>
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section && `(Sec ${c.section})`}</option>)}
                                </select>
                            </div>

                            <div className="pt-6">
                                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-black transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                    {loading ? "Processing..." : <><FaUserPlus /> Complete Admission</>}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
}

export default AdminAdmission;
