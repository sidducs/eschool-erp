import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaUser, FaEnvelope, FaLock, FaUniversity, FaUserPlus, FaLayerGroup } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
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
        addToast("Account created successfully!", "success");
        navigate(formData.role === 'admin' ? '/admin' : formData.role === 'teacher' ? '/teacher' : '/student');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">

        {/* Header */}
        <div className="bg-slate-50 py-6 px-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <FaUniversity size={22} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">Join ESchool ERP</h4>
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
                  <FaUser className="text-slate-400 text-sm" />
                </div>
                <input
                  name="name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400 text-sm" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
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
                  <FaLock className="text-slate-400 text-sm" />
                </div>
                <input
                  type="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLayerGroup className="text-slate-400 text-sm" />
                </div>
                <select
                  name="role"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700 appearance-none"
                  onChange={handleChange}
                  defaultValue="student"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center mt-2"
              disabled={loading}
            >
              {loading ? "Creating..." : (
                <span className="flex items-center">
                  <FaUserPlus className="mr-2" /> Create Account
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <p className="text-slate-500 text-sm">
              Already have an account?
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;