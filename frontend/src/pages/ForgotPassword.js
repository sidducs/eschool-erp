import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
          <h4 className="text-2xl font-bold text-slate-800 mb-1">Forgot Password</h4>
          <p className="text-slate-500 text-sm">Enter your registered email address</p>
        </div>

        <div className="p-8">
          {success ? (
            <div className="text-center py-4 animate-fadeIn">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
                <FaCheckCircle size={40} />
              </div>
              <h5 className="text-xl font-bold text-slate-800 mb-2">Check Your Email</h5>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>. The link expires in 15 minutes.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-all transform hover:-translate-x-1">
                <FaArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2 font-medium animate-pulse">
                  <FaExclamationCircle className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-slate-700"
                      placeholder="name@school.com"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="text-center mt-8 pt-6 border-t border-slate-100">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors">
                  <FaArrowLeft size={12} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
