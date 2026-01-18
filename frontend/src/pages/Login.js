// export default Login;
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext"; // Kept your context
import { FaEnvelope, FaLock, FaUniversity, FaSignInAlt } from "react-icons/fa";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Local error state for better UI control
  
  const { showToast } = useContext(ToastContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });

  // --- STYLES ---
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", // Matches Landing Page
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: "20px"
    },
    card: {
      maxWidth: "450px",
      width: "100%",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      border: "1px solid #e2e8f0"
    },
    header: {
      backgroundColor: "#f8fafc",
      padding: "2rem",
      textAlign: "center",
      borderBottom: "1px solid #e2e8f0"
    },
    formSection: {
      padding: "2rem"
    },
    inputGroupText: {
      backgroundColor: "#f1f5f9",
      borderRight: "none",
      color: "#64748b",
      borderColor: "#e2e8f0"
    },
    input: {
      borderLeft: "none",
      borderColor: "#e2e8f0",
      padding: "0.75rem",
      fontSize: "0.95rem",
      backgroundColor: "#f8fafc"
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", formData);
      await login(res.data.token);
      
      // Optional: Use toast if you prefer, or just navigate
      if(showToast) showToast("Login successful", "success");

      // Redirect based on role
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "teacher") navigate("/teacher");
      else navigate("/student");

    } catch (err) {
      // Set local error to display in the form
      setError(err.response?.data?.message || "Invalid email or password");
      if(showToast) showToast("Login failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Header */}
        <div style={styles.header}>
           <div className="bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{width: '60px', height: '60px'}}>
              <FaUniversity size={28} />
           </div>
           <h4 className="fw-bold text-dark mb-1">Welcome Back</h4>
           <p className="text-muted small mb-0">Sign in to your ESchool account</p>
        </div>

        {/* Form */}
        <div style={styles.formSection}>
          
          {error && (
            <div className="alert alert-danger py-2 small text-center border-0 bg-danger bg-opacity-10 text-danger mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>Email Address</label>
              <div className="input-group">
                <span className="input-group-text" style={styles.inputGroupText}><FaEnvelope /></span>
                <input
                  type="email"
                  name="email"
                  className="form-control shadow-none"
                  style={styles.input}
                  placeholder="name@school.com"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted small fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>Password</label>
              <div className="input-group">
                <span className="input-group-text" style={styles.inputGroupText}><FaLock /></span>
                <input
                  type="password"
                  name="password"
                  className="form-control shadow-none"
                  style={styles.input}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? (
                 <>Please wait...</>
              ) : (
                 <><FaSignInAlt className="me-2"/> Login to Dashboard</>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
             <span className="text-muted small">New to ESchool? </span>
             <Link to="/register" className="text-decoration-none fw-bold ms-1 text-primary">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;