import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";
import { FaUser, FaEnvelope, FaLock, FaUniversity, FaUserPlus, FaLayerGroup } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  // --- COMPACT STYLES ---
  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: "10px" // Reduced container padding
    },
    card: {
      maxWidth: "450px", // Slightly narrower
      width: "100%",
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      border: "1px solid #e2e8f0"
    },
    header: {
      backgroundColor: "#f8fafc",
      padding: "1.2rem", // Reduced from 2rem
      textAlign: "center",
      borderBottom: "1px solid #e2e8f0"
    },
    formSection: { 
      padding: "1.5rem" // Reduced from 2rem
    },
    inputGroupText: {
      backgroundColor: "#f1f5f9",
      borderRight: "none",
      color: "#64748b",
      borderColor: "#e2e8f0",
      fontSize: "0.9rem"
    },
    input: {
      borderLeft: "none",
      borderColor: "#e2e8f0",
      padding: "0.6rem 0.75rem", // More compact input height
      fontSize: "0.9rem",
      backgroundColor: "#f8fafc"
    }
  };

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
      if(res.data.token) {
        await login(res.data.token);
        if(showToast) showToast("Account created successfully!", "success");
        navigate(formData.role === 'admin' ? '/admin' : formData.role === 'teacher' ? '/teacher' : '/student');
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      if(showToast) showToast("Registration Failed", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Header - Compact */}
        <div style={styles.header}>
           <div className="bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center rounded-circle mb-2" style={{width: '45px', height: '45px'}}>
              <FaUniversity size={20} />
           </div>
           <h5 className="fw-bold text-dark mb-0">Join ESchool ERP</h5>
        </div>

        {/* Form - Compact */}
        <div style={styles.formSection}>
          {error && <div className="alert alert-danger py-1 small text-center mb-3">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text" style={styles.inputGroupText}><FaUser /></span>
                <input name="name" className="form-control shadow-none" style={styles.input} placeholder="Full Name" onChange={handleChange} required />
              </div>
            </div>

            {/* Email */}
            <div className="mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text" style={styles.inputGroupText}><FaEnvelope /></span>
                <input type="email" name="email" className="form-control shadow-none" style={styles.input} placeholder="Email Address" onChange={handleChange} required />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text" style={styles.inputGroupText}><FaLock /></span>
                <input type="password" name="password" className="form-control shadow-none" style={styles.input} placeholder="Password" onChange={handleChange} required />
              </div>
            </div>

            {/* Role */}
            <div className="mb-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text" style={styles.inputGroupText}><FaLayerGroup /></span>
                <select name="role" className="form-select shadow-none" style={styles.input} onChange={handleChange} defaultValue="student">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button className="btn btn-primary w-100 btn-sm py-2 fw-bold shadow-sm" disabled={loading}>
              {loading ? "Creating..." : <><FaUserPlus className="me-2"/> Create Account</>}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-3 pt-2 border-top">
             <span className="text-muted small">Already have an account? </span>
             <Link to="/login" className="text-decoration-none fw-bold ms-1 text-primary small">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;