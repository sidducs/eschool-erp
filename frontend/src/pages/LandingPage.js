
import { Link } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUniversity, FaArrowRight, FaCheckCircle } from "react-icons/fa";

function LandingPage() {

  // --- STYLES ---
  const styles = {
    font: { fontFamily: "'Inter', sans-serif" },
    hero: {
      backgroundColor: "#1e293b", // Navy Blue
      color: "white",
      padding: "100px 0 140px",
      position: "relative",
      overflow: "hidden"
    },
    heroShape: {
      position: "absolute",
      bottom: "-1px",
      left: 0,
      width: "100%",
      height: "100px",
      backgroundColor: "#f8fafc",
      clipPath: "polygon(0 100%, 100% 100%, 100% 0)"
    },
    card: {
      border: "none",
      borderRadius: "16px",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      backgroundColor: "white",
      height: "100%",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
    },
    iconBox: (color) => ({
      width: "60px",
      height: "60px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      backgroundColor: color === 'blue' ? '#eff6ff' : color === 'green' ? '#f0fdf4' : '#fef2f2',
      color: color === 'blue' ? '#3b82f6' : color === 'green' ? '#16a34a' : '#ef4444',
    }),
    btnPrimary: {
      backgroundColor: "#3b82f6",
      border: "none",
      padding: "12px 32px",
      fontWeight: "600",
      borderRadius: "8px",
      color: "white",
      textDecoration: "none",
      display: "inline-block",
      transition: "background 0.2s"
    },
    navbar: {
      padding: "20px 0",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 10
    }
  };

  return (
    <div style={styles.font} className="bg-light min-vh-100 d-flex flex-column">
      
      {/* --- NAVBAR --- */}
      <nav style={styles.navbar}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 text-white">
             <div className="bg-primary p-2 rounded"><FaUniversity size={20}/></div>
             <span className="fw-bold fs-5 tracking-tight">ESchool ERP</span>
          </div>
          <div>
            <Link to="/login" className="text-white text-decoration-none fw-semibold me-4">Log In</Link>
            <Link to="/register" className="btn btn-light text-primary fw-bold px-4 rounded-pill">Register</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section style={styles.hero}>
        <div className="container text-center" style={{marginTop: "40px"}}>
          <div className="d-inline-block px-3 py-1 rounded-pill bg-primary bg-opacity-25 text-info border border-primary border-opacity-25 mb-4 fw-bold small">
            🚀 Advanced School Management System
          </div>
          <h1 className="display-3 fw-bold mb-4">Manage Your Institute <br/><span className="text-primary">Effortlessly</span></h1>
          <p className="lead text-secondary mx-auto mb-5" style={{maxWidth: "700px", color: "#94a3b8"}}>
            Streamline administration, empower teachers, and engage students with our comprehensive digital management solution.
          </p>
          <div className="d-flex justify-content-center gap-3">
             <Link to="/login" style={styles.btnPrimary} className="shadow-lg hover-scale">
                Get Started Now <FaArrowRight className="ms-2"/>
             </Link>
          </div>
        </div>
        <div style={styles.heroShape}></div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-5 bg-light flex-grow-1">
        <div className="container" style={{marginTop: "-80px"}}>
           <div className="row g-4">
              
              {/* ADMIN CARD */}
              <div className="col-md-4">
                 <div className="p-4 p-lg-5" style={styles.card}>
                    <div style={styles.iconBox('red')}>
                       <FaUserShield size={28}/>
                    </div>
                    <h4 className="fw-bold text-dark">Admin Control</h4>
                    <p className="text-muted mb-4">Complete control over users, classes, fees, and system settings.</p>
                    <ul className="list-unstyled text-muted small">
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Manage Students & Teachers</li>
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Track Fee Payments</li>
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Generate Reports</li>
                    </ul>
                 </div>
              </div>

              {/* TEACHER CARD */}
              <div className="col-md-4">
                 <div className="p-4 p-lg-5" style={styles.card}>
                    <div style={styles.iconBox('blue')}>
                       <FaChalkboardTeacher size={28}/>
                    </div>
                    <h4 className="fw-bold text-dark">Teacher Portal</h4>
                    <p className="text-muted mb-4">Effortless tools for grading, attendance, and scheduling.</p>
                    <ul className="list-unstyled text-muted small">
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Digital Attendance</li>
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Result & Grade Entry</li>
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>View Timetables</li>
                    </ul>
                 </div>
              </div>

              {/* STUDENT CARD */}
              <div className="col-md-4">
                 <div className="p-4 p-lg-5" style={styles.card}>
                    <div style={styles.iconBox('green')}>
                       <FaUserGraduate size={28}/>
                    </div>
                    <h4 className="fw-bold text-dark">Student Access</h4>
                    <p className="text-muted mb-4">Real-time access to academic progress and resources.</p>
                    <ul className="list-unstyled text-muted small">
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>View Results & Grades</li>
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Download Fee Receipts</li>
                       <li className="mb-2"><FaCheckCircle className="text-success me-2"/>Check Attendance</li>
                    </ul>
                 </div>
              </div>

           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-4 border-top text-center mt-auto">
         <div className="container text-muted small">
            &copy; {new Date().getFullYear()} ESchool ERP. All rights reserved. <br/>
            Designed for Modern Education.
         </div>
      </footer>

    </div>
  );
}

export default LandingPage;