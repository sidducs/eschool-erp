import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaUser, FaEnvelope, FaLock, FaChild, FaUserPlus, FaUserTie } from "react-icons/fa";

function ParentRegister() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { addToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "parent",
        childSRN: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/api/auth/register", formData);
            if (res.data.token) {
                await login(res.data.token);
                addToast("Parent account created successfully!", "success");
                navigate('/parent/dashboard');
            } else {
                navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
            addToast("Registration Failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-800 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">

                {/* Header */}
                <div className="bg-indigo-50 py-6 px-6 text-center border-b border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <FaUserTie size={22} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Parent Registration</h4>
                    <p className="text-xs text-slate-500 mt-1">Connect with your child's academic journey</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    {error && (
                        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-indigo-300 text-sm" />
                                </div>
                                <input
                                    name="name"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                                    placeholder="Your Full Name"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-indigo-300 text-sm" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                                    placeholder="Email Address"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-indigo-300 text-sm" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                                    placeholder="Password"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Child's SRN */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Link Student</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaChild className="text-indigo-300 text-sm" />
                                </div>
                                <input
                                    name="childSRN"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder-slate-400"
                                    placeholder="Enter Child's SRN (e.g. 2024001)"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">This links your account to your child's data.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center mt-4"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : (
                                <span className="flex items-center">
                                    <FaUserPlus className="mr-2" /> Register as Parent
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-6 pt-4 border-t border-slate-100">
                        <p className="text-slate-500 text-sm">
                            Not a parent?
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors">Student/Teacher Register</Link>
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                            Already have an account?
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ParentRegister;
