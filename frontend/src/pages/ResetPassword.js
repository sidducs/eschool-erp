import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

function ResetPassword() {
  const { token } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      await api.put(`/api/auth/reset-password/${token}`, { password: formData.password });
      setSuccess(true);
      addToast("Password reset successful!", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Link may be expired or invalid");
      addToast("Reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-slate-50 py-8 px-6 text-center border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaLock size={30} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 mb-1">Set New Password</h4>
          <p className="text-slate-500 text-sm">Choose a strong password for your account</p>
        </div>

        <div className="p-8">
          {success ? (
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                <FaCheckCircle size={40} />
              </div>
              <h5 className="text-xl font-bold text-slate-800 mb-2">Password Reset!</h5>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your password has been successfully updated. Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 font-medium animate-pulse">
                  <FaExclamationCircle className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                      placeholder="••••••••"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                      placeholder="••••••••"
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
