// // import { useNavigate } from "react-router-dom";

// // function LandingPage() {
// //   const navigate = useNavigate();

// //   return (
// //     <div
// //       className="d-flex align-items-center justify-content-center"
// //       style={{
// //         minHeight: "100vh",
// //         background: "linear-gradient(135deg, #111827, #1f2933)",
// //       }}
// //     >
// //       <div
// //         className="text-center p-5 bg-white shadow-lg"
// //         style={{ maxWidth: "520px", width: "100%", borderRadius: "14px" }}
// //       >
// //         <h1 className="mb-2 fw-bold">ESchool ERP</h1>
// //         <p className="text-muted mb-4">
// //           A complete School Management System for
// //           <br />
// //           <strong>Admins • Teachers • Students</strong>
// //         </p>

// //         <div className="d-grid gap-3">
// //           <button
// //             className="btn btn-dark btn-lg"
// //             onClick={() => navigate("/login")}
// //           >
// //             Login
// //           </button>

// //           <button
// //             className="btn btn-outline-dark btn-lg"
// //             onClick={() => navigate("/register")}
// //           >
// //             Register
// //           </button>
// //         </div>

// //         <hr className="my-4" />

// //         <small className="text-muted">
// //           © {new Date().getFullYear()} ESchool ERP
// //         </small>
// //       </div>
// //     </div>
// //   );
// // }

// // export default LandingPage;




// // import { useNavigate } from "react-router-dom";

// // function LandingPage() {
// //   const navigate = useNavigate();

// //   return (
// //     <div
// //       style={{
// //         minHeight: "100vh",
// //         background: "linear-gradient(135deg, #0f172a, #111827)",
// //         color: "#fff",
// //       }}
// //     >
// //       {/* HERO */}
// //       <div className="container py-5">
// //         <div className="row align-items-center">
// //           <div className="col-md-6 mb-4 mb-md-0">
// //             <h1 className="display-5 fw-bold mb-3">
// //               ESchool ERP
// //             </h1>
// //             <p className="text-secondary fs-5 mb-4">
// //               A complete School Management System for  
// //               <br />
// //               <strong className="text-light">
// //                 Admins • Teachers • Students
// //               </strong>
// //             </p>

// //             <div className="d-flex gap-3">
// //               <button
// //                 className="btn btn-light btn-lg"
// //                 onClick={() => navigate("/login")}
// //               >
// //                 Login
// //               </button>

// //               <button
// //                 className="btn btn-outline-light btn-lg"
// //                 onClick={() => navigate("/register")}
// //               >
// //                 Register
// //               </button>
// //             </div>
// //           </div>

// //           <div className="col-md-6">
// //             <div
// //               className="bg-white text-dark p-4 shadow-lg"
// //               style={{ borderRadius: "14px" }}
// //             >
// //               <h5 className="fw-bold mb-3">Why ESchool ERP?</h5>
// //               <ul className="list-unstyled mb-0">
// //                 <li className="mb-2">✔ Centralized student management</li>
// //                 <li className="mb-2">✔ Attendance & exam automation</li>
// //                 <li className="mb-2">✔ Fee tracking with receipts</li>
// //                 <li className="mb-2">✔ Role-based dashboards</li>
// //                 <li>✔ Secure & fast workflow</li>
// //               </ul>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* FEATURES */}
// //       <div className="container pb-5">
// //         <div className="row text-center g-4">
// //           {[
// //             ["Admin Panel", "Manage users, classes, exams & fees"],
// //             ["Teacher Workspace", "Mark attendance & enter results"],
// //             ["Student Portal", "View attendance, results & receipts"],
// //           ].map(([title, desc]) => (
// //             <div className="col-md-4" key={title}>
// //               <div
// //                 className="p-4 h-100"
// //                 style={{
// //                   background: "#0b1220",
// //                   borderRadius: "12px",
// //                   border: "1px solid #1f2933",
// //                 }}
// //               >
// //                 <h5 className="fw-bold mb-2">{title}</h5>
// //                 <p className="text-secondary mb-0">{desc}</p>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {/* FOOTER */}
// //       <div
// //         className="text-center py-3"
// //         style={{ borderTop: "1px solid #1f2933" }}
// //       >
// //         <small className="text-secondary">
// //           © {new Date().getFullYear()} ESchool ERP • Built for modern schools
// //         </small>
// //       </div>
// //     </div>
// //   );
// // }

// // export default LandingPage;

// import { useNavigate } from "react-router-dom";

// function LandingPage() {
//   const navigate = useNavigate();

//   return (
//     <div style={{ fontFamily: "Arial, sans-serif" }}>

//       {/* HERO */}
//       <section
//         className="text-white text-center p-5"
//         style={{
//           background:
//             "linear-gradient(135deg, #111827, #000)",
//         }}
//       >
//         <div className="container">
//           <h1 className="display-4 fw-bold">eSchool ERP</h1>
//           <p className="lead">
//             One-Stop School Management ERP for Admins, Teachers, Students & Parents
//           </p>

//           <div className="d-flex justify-content-center gap-3 mt-4">
//             <button
//               className="btn btn-light btn-lg"
//               onClick={() => navigate("/login")}
//             >
//               Login
//             </button>
//             <button
//               className="btn btn-light btn-lg"
//               onClick={() => navigate("/register")}
//             >
//               Register
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section className="py-5" style={{ background: "#f4f6f9" }}>
//         <div className="container">
//           <h2 className="text-center fw-bold mb-4">Key Features</h2>

//           <div className="row g-4">
//             {[
//               ["Attendance Tracking", "Mark & review attendance easily"],
//               ["Fee & Receipt Management", "Automate fees & receipts"],
//               ["Exam & Result System", "Create exams & publish marks"],
//               ["Parent Portal", "Parents view performance in real time"],
//               ["Accounting", "Manage accounts & finances"],
//               ["Transport & Bus Tracking", "Manage routes & tracking"],
//               ["Timetable & Calendar", "Combined timetable tools"],
//               ["Notification & SMS Alerts", "Updates via SMS & alerts"],
//             ].map(([title, desc]) => (
//               <div className="col-md-3" key={title}>
//                 <div className="p-3 bg-white shadow-sm rounded">
//                   <h5 className="fw-semibold">{title}</h5>
//                   <p className="text-muted">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* BENEFITS */}
//       <section className="py-5">
//         <div className="container">
//           <h2 className="text-center fw-bold mb-4">Designed for Every User</h2>

//           <div className="row g-4">
//             {[
//               ["Admins", "Full control over school data & settings"],
//               ["Teachers", "Mark attendance & enter results"],
//               ["Students", "Track performance & downloads"],
//               ["Parents", "Transparent performance & fees info"],
//             ].map(([role, desc]) => (
//               <div className="col-md-3 text-center" key={role}>
//                 <div className="p-3 bg-white shadow-sm rounded">
//                   <h5 className="fw-semibold">{role}</h5>
//                   <p className="text-muted">{desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section
//         className="text-center text-white py-5"
//         style={{ background: "#000" }}
//       >
//         <div className="container">
//           <h2 className="fw-bold mb-3">Ready to Automate Your School?</h2>
//           <button
//             className="btn btn-light btn-lg"
//             onClick={() => alert("Request demo coming soon!")}
//           >
//             Request a Demo
//           </button>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer
//         className="text-center text-secondary p-3"
//         style={{ borderTop: "1px solid #ddd" }}
//       >
//         © {new Date().getFullYear()} ESchool ERP — Simple. Powerful. Reliable.
//       </footer>

//     </div>
//   );
// }

// export default LandingPage;
// import { useNavigate } from "react-router-dom";
// import { 
//   FaUniversity, FaUserGraduate, FaChalkboardTeacher, FaUserTie, 
//   FaMoneyBillWave, FaClipboardCheck, FaBook, FaCalendarAlt, FaShieldAlt 
// } from "react-icons/fa";

// function LandingPage() {
//   const navigate = useNavigate();

//   // --- STYLES (Matching AdminDashboard) ---
//   const styles = {
//     hero: {
//       background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", // Navy Theme
//       color: "white",
//       padding: "100px 0 80px",
//       borderBottom: "1px solid #334155"
//     },
//     section: {
//       padding: "80px 0",
//       backgroundColor: "#f8fafc" // Light Slate
//     },
//     card: {
//       background: "white",
//       borderRadius: "12px",
//       padding: "2rem",
//       boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
//       border: "1px solid #e2e8f0",
//       transition: "transform 0.2s ease, box-shadow 0.2s ease",
//       height: "100%"
//     },
//     iconBox: {
//       width: "60px",
//       height: "60px",
//       borderRadius: "12px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "24px",
//       marginBottom: "1.5rem"
//     },
//     btnPrimary: {
//       backgroundColor: "#3b82f6",
//       border: "none",
//       padding: "12px 32px",
//       fontSize: "1.1rem",
//       fontWeight: "600",
//       borderRadius: "8px",
//       color: "white"
//     },
//     btnOutline: {
//       border: "2px solid rgba(255,255,255,0.2)",
//       padding: "12px 32px",
//       fontSize: "1.1rem",
//       fontWeight: "600",
//       borderRadius: "8px",
//       color: "white",
//       background: "transparent"
//     }
//   };

//   return (
//     <div style={{ fontFamily: "'Inter', sans-serif" }}>
      
//       {/* --- NAVBAR --- */}
//       <nav className="navbar navbar-expand-lg fixed-top" style={{ background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)" }}>
//         <div className="container">
//           <div className="d-flex align-items-center text-white">
//             <div className="bg-primary rounded p-2 me-2 d-flex align-items-center justify-content-center">
//                <FaUniversity size={20} color="white" />
//             </div>
//             <span className="fw-bold fs-5 tracking-tight">ESchool ERP</span>
//           </div>
//           <div className="d-flex gap-3">
//             <button className="btn btn-sm text-white fw-bold" onClick={() => navigate("/login")}>Login</button>
//             <button className="btn btn-sm btn-primary fw-bold px-3" onClick={() => navigate("/register")}>Get Started</button>
//           </div>
//         </div>
//       </nav>

//       {/* --- HERO SECTION --- */}
//       <section style={styles.hero}>
//         <div className="container text-center">
//           <div className="row justify-content-center">
//             <div className="col-lg-8">
//               <span className="badge bg-primary bg-opacity-25 text-primary border border-primary mb-3 px-3 py-2 rounded-pill">
//                  v2.0 Now Live
//               </span>
//               <h1 className="display-3 fw-bold mb-4" style={{ letterSpacing: "-1px" }}>
//                 Modern Management for <br/> <span className="text-primary">Smart Schools</span>
//               </h1>
//               <p className="lead text-secondary mb-5 px-5 mx-5">
//                 Streamline operations with our all-in-one ERP. Manage Fees, Attendance, Exams, and Timetables in a single secure cloud platform.
//               </p>
              
//               <div className="d-flex justify-content-center gap-3">
//                 <button className="btn btn-primary btn-lg shadow-lg hover-scale" onClick={() => navigate("/register")}>
//                   Create Admin Account
//                 </button>
//                 <button className="btn btn-outline-light btn-lg hover-scale" onClick={() => navigate("/login")}>
//                   Login to Portal
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- FEATURES GRID --- */}
//       <section style={styles.section}>
//         <div className="container">
//           <div className="text-center mb-5">
//             <h6 className="text-primary fw-bold text-uppercase">Powerful Features</h6>
//             <h2 className="fw-bold text-dark">Everything you need to run your institute</h2>
//           </div>

//           <div className="row g-4">
//             {[
//               { t: "Fee Management", d: "Create fee structures, assign to students, and download PDF receipts instantly.", i: FaMoneyBillWave, c: "success" },
//               { t: "Exam Automation", d: "Schedule exams, manage marks, and generate report cards automatically.", i: FaBook, c: "primary" },
//               { t: "Attendance Tracking", d: "Mark student and staff attendance with detailed monthly reports.", i: FaClipboardCheck, c: "warning" },
//               { t: "Smart Timetable", d: "Conflict-free scheduling for classes and teachers by day and slot.", i: FaCalendarAlt, c: "info" },
//               { t: "Bulk Data Upload", d: "Onboard hundreds of students in seconds using CSV bulk upload.", i: FaUserGraduate, c: "danger" },
//               { t: "Role-Based Security", d: "Secure access for Admins, Teachers, and Students with specific permissions.", i: FaShieldAlt, c: "dark" }
//             ].map((f, i) => (
//               <div className="col-md-4" key={i}>
//                 <div style={styles.card} className="feature-card">
//                    <div style={{...styles.iconBox, backgroundColor: `var(--bs-${f.c}-bg-subtle)`, color: `var(--bs-${f.c})`}}>
//                       <f.i />
//                    </div>
//                    <h5 className="fw-bold text-dark">{f.t}</h5>
//                    <p className="text-muted small mb-0">{f.d}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* --- USER ROLES --- */}
//       <section className="py-5 bg-white border-top">
//         <div className="container py-4">
//           <div className="row g-5 align-items-center">
//              <div className="col-md-5">
//                 <h2 className="fw-bold mb-4">Tailored for every user</h2>
//                 <p className="text-muted mb-4">ESchool ERP provides specific dashboards for every stakeholder in your educational ecosystem.</p>
                
//                 <div className="d-flex align-items-center mb-4">
//                    <div className="bg-primary text-white rounded-circle p-3 me-3"><FaUserTie size={20}/></div>
//                    <div><h6 className="fw-bold m-0">Administrators</h6><small className="text-muted">Full control over finances, users, and settings.</small></div>
//                 </div>
//                 <div className="d-flex align-items-center mb-4">
//                    <div className="bg-success text-white rounded-circle p-3 me-3"><FaChalkboardTeacher size={20}/></div>
//                    <div><h6 className="fw-bold m-0">Teachers</h6><small className="text-muted">Manage classes, marks, and attendance.</small></div>
//                 </div>
//                 <div className="d-flex align-items-center">
//                    <div className="bg-info text-white rounded-circle p-3 me-3"><FaUserGraduate size={20}/></div>
//                    <div><h6 className="fw-bold m-0">Students</h6><small className="text-muted">View results, download receipts, and schedules.</small></div>
//                 </div>
//              </div>
             
//              {/* Mockup / Graphic Side */}
//              <div className="col-md-7">
//                 <div className="p-4 bg-light rounded-4 border shadow-sm">
//                    <div className="row g-3">
//                       <div className="col-6">
//                          <div className="bg-white p-3 rounded shadow-sm mb-3 border-start border-4 border-primary">
//                             <small className="text-muted fw-bold">TOTAL FEES</small>
//                             <h4 className="fw-bold text-dark m-0">₹45,20,000</h4>
//                          </div>
//                          <div className="bg-white p-3 rounded shadow-sm border-start border-4 border-success">
//                             <small className="text-muted fw-bold">ATTENDANCE</small>
//                             <h4 className="fw-bold text-dark m-0">94.5%</h4>
//                          </div>
//                       </div>
//                       <div className="col-6 d-flex flex-column justify-content-center">
//                           <div className="bg-white p-3 rounded shadow-sm text-center">
//                              <FaUserGraduate size={40} className="text-primary mb-2 opacity-50"/>
//                              <h6 className="fw-bold">Student Portal</h6>
//                              <small className="text-muted d-block">Results & Receipts</small>
//                              <div className="btn btn-sm btn-light mt-2 w-100">Login</div>
//                           </div>
//                       </div>
//                    </div>
//                 </div>
//              </div>
//           </div>
//         </div>
//       </section>

//       {/* --- FOOTER --- */}
//       <footer className="bg-dark text-white py-5" style={{borderTop: "1px solid #334155"}}>
//         <div className="container">
//           <div className="row g-4">
//              <div className="col-md-4">
//                 <div className="d-flex align-items-center mb-3">
//                    <FaUniversity className="text-primary me-2" size={24}/>
//                    <h5 className="m-0 fw-bold">ESchool ERP</h5>
//                 </div>
//                 <p className="text-secondary small">Empowering educational institutions with secure, scalable, and simple management tools.</p>
//              </div>
//              <div className="col-md-2 offset-md-2">
//                 <h6 className="fw-bold mb-3">Product</h6>
//                 <ul className="list-unstyled small text-secondary">
//                    <li className="mb-2">Features</li>
//                    <li className="mb-2">Pricing</li>
//                    <li className="mb-2">Updates</li>
//                 </ul>
//              </div>
//              <div className="col-md-2">
//                 <h6 className="fw-bold mb-3">Support</h6>
//                 <ul className="list-unstyled small text-secondary">
//                    <li className="mb-2">Documentation</li>
//                    <li className="mb-2">Contact Us</li>
//                    <li className="mb-2">FAQ</li>
//                 </ul>
//              </div>
//              <div className="col-md-2">
//                 <h6 className="fw-bold mb-3">Legal</h6>
//                 <ul className="list-unstyled small text-secondary">
//                    <li className="mb-2">Privacy</li>
//                    <li className="mb-2">Terms</li>
//                 </ul>
//              </div>
//           </div>
//           <div className="border-top border-secondary pt-4 mt-4 text-center">
//              <small className="text-secondary">© {new Date().getFullYear()} ESchool ERP System. All rights reserved.</small>
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }

// export default LandingPage;

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