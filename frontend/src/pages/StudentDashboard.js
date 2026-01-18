import { useState, useContext, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Sub-components
import StudentAttendance from "../pages/StudentAttendance"; 
import StudentTimetable from "../pages/StudentTimetable";   
import StudentResults from "../pages/StudentResults";       

import {
  FaBars, FaTachometerAlt, FaClipboardCheck, FaBook, FaCalendarAlt,
  FaFilePdf, FaSignOutAlt, FaUserGraduate, FaBell, FaDownload, FaBullhorn,
  FaCheckCircle, FaMoneyBillWave
} from "react-icons/fa";

function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);

  // --- STATE ---
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState({
    attendancePercent: 0,
    examsTaken: 0,
    feeStatus: "Pending"
  });
  
  const [notices, setNotices] = useState([]);
  const [fee, setFee] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  // --- STYLES ---
  const styles = {
    font: { fontFamily: "'Inter', sans-serif" },
    sidebar: { backgroundColor: "#1e293b", minHeight: "100vh", color: "#f8fafc" },
    main: { backgroundColor: "#f1f5f9", minHeight: "100vh" },
    card: { border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", background: "white" },
    headerText: { color: "#334155", fontWeight: "700" },
    labelText: { color: "#64748b", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
    menuBtn: (isActive) => ({
      backgroundColor: isActive ? "#3b82f6" : "transparent",
      color: isActive ? "white" : "#cbd5e1",
      border: "none", padding: "12px 16px", width: "100%", textAlign: "left",
      borderRadius: "8px", marginBottom: "4px", fontSize: "0.95rem", fontWeight: "500",
      transition: "all 0.2s"
    })
  };

  // --- FETCH DASHBOARD OVERVIEW DATA ---
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [attendanceRes, resultsRes, feeRes, noticesRes] = await Promise.allSettled([
          api.get("/api/attendance/me"),
          api.get("/api/results/student"),
          api.get("/api/fees/my-fee"),
          api.get("/api/notices")
        ]);

        // 1. Process Attendance (Backend returns Object { percentage, records: [] })
        let attPct = 0;
        if (attendanceRes.status === "fulfilled" && attendanceRes.value.data) {
           // FIXED: Reading percentage directly from the object
           attPct = attendanceRes.value.data.percentage || 0; 
        }

        // 2. Process Results (Backend returns Array)
        let totalExams = 0;
        if (resultsRes.status === "fulfilled" && Array.isArray(resultsRes.value.data)) {
           totalExams = resultsRes.value.data.length;
        }

        // 3. Process Fees
        let fStatus = "Pending";
        if (feeRes.status === "fulfilled" && feeRes.value.data) {
           fStatus = feeRes.value.data.status || "Pending";
        }

        // 4. Process Notices
        if (noticesRes.status === "fulfilled" && Array.isArray(noticesRes.value.data)) {
           setNotices(noticesRes.value.data);
        }

        setStats({
            attendancePercent: attPct,
            examsTaken: totalExams,
            feeStatus: fStatus
        });

      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);


  // --- FETCH FEES (Detail View) ---
  useEffect(() => {
    if (activeMenu === "fees") {
      const loadFees = async () => {
        try {
          setFeeLoading(true);
          const res = await api.get("/api/fees/my-fee");
          setFee(res.data);
        } catch {
          setFee(null);
        } finally {
          setFeeLoading(false);
        }
      };
      loadFees();
    }
  }, [activeMenu]);

  // --- DOWNLOAD RECEIPT ---
  const downloadReceipt = async () => {
    try {
      const res = await api.get("/api/fees/receipt/my", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // ✅ FIX: Use user name in filename
      // Replace spaces with underscores (e.g. "John Doe" -> "John_Doe")
      const safeName = user?.name ? user.name.replace(/\s+/g, '_') : "Student";
      link.setAttribute('download', `${safeName}_Receipt.pdf`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up
    } catch (err) {
      alert("Failed to download receipt");
    }
  };

  // --- MENU ITEMS ---
  const menus = [
    { id: "dashboard", label: "Overview", icon: FaTachometerAlt },
    { id: "attendance", label: "Attendance", icon: FaClipboardCheck },
    { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
    { id: "results", label: "Results", icon: FaBook },
    { id: "fees", label: "Fees & Invoice", icon: FaFilePdf },
  ];

  if (loading) return <div className="p-5 text-center">Loading Student Portal...</div>;

  return (
    <div className="d-flex" style={styles.font}>
      
      {/* SIDEBAR */}
      <div className={`d-none d-md-block p-3`} style={{ ...styles.sidebar, width: showSidebar ? "260px" : "0px", overflow: "hidden", transition: "width 0.3s" }}>
        <div className="d-flex align-items-center mb-5 px-2">
           <div className="bg-primary rounded p-2 me-2"><FaUserGraduate size={20} color="white"/></div>
           <h5 className="mb-0 fw-bold text-white">Student Portal</h5>
        </div>
        {menus.map((m) => (
          <button key={m.id} style={styles.menuBtn(activeMenu === m.id)} onClick={() => setActiveMenu(m.id)}>
            <m.icon className="me-3" style={{opacity: 0.8}} /> {m.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1" style={styles.main}>
        
        {/* NAVBAR */}
        <div className="bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom sticky-top">
          <div className="d-flex align-items-center">
             <button className="btn btn-light me-3 d-md-none" onClick={() => setShowSidebar(!showSidebar)}><FaBars/></button>
             <h5 className="mb-0" style={styles.headerText}>{activeMenu.toUpperCase()}</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
             <button className="btn btn-light position-relative p-2 rounded-circle">
                <FaBell color="#64748b"/>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle border border-white"></span>
             </button>
             <div className="text-end d-none d-sm-block lh-1 me-2">
                <div className="fw-bold text-dark small">{user?.name}</div>
                <div className="text-muted" style={{fontSize:'10px'}}>STUDENT</div>
             </div>
             <button onClick={logout} className="btn btn-outline-danger btn-sm rounded px-3 d-flex align-items-center">
               <FaSignOutAlt className="me-2" /> Logout
             </button>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="p-4" style={{height: 'calc(100vh - 70px)', overflowY: 'auto'}}>

          {activeMenu === "dashboard" && (
            <div className="fade-in">
              <div className="mb-4">
                 <h4 className="fw-bold text-dark">Welcome back, {user?.name?.split(" ")[0]}!</h4>
                 <p className="text-muted">Here is your academic overview.</p>
              </div>

              {/* NOTICE BOARD WIDGET */}
              <div className="row mb-4">
                <div className="col-12">
                  <div style={styles.card} className="p-3 border-0 shadow-sm">
                     <h6 className="fw-bold mb-3 border-bottom pb-2">
                        <FaBullhorn className="text-warning me-2"/> Latest Announcements
                     </h6>
                     {notices.length === 0 ? (
                       <p className="text-muted small">No new announcements.</p>
                     ) : (
                       notices.slice(0, 3).map((n, i) => (
                         <div key={n._id || i} className="alert alert-info border-0 mb-2 py-2 d-flex align-items-center">
                           <FaBullhorn className="me-2 text-info"/>
                           <div>
                              <strong>{n.title}</strong> <span className="text-muted small mx-2">|</span> <span className="small">{n.content}</span>
                           </div>
                         </div>
                       ))
                     )}
                  </div>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="row g-4">
                  {/* Attendance Card */}
                  <div className="col-md-4">
                    <div className="p-4 bg-white h-100 cursor-pointer" style={styles.card} onClick={() => setActiveMenu("attendance")}>
                       <div className="d-flex justify-content-between align-items-center">
                          <div>
                             <div style={styles.labelText}>Attendance</div>
                             <h2 className="fw-bold mt-2">{stats.attendancePercent}%</h2>
                          </div>
                          <div className="bg-primary bg-opacity-10 text-primary p-4 rounded-circle"><FaCheckCircle size={24}/></div>
                       </div>
                    </div>
                  </div>

                  {/* Results Card */}
                  <div className="col-md-4">
                    <div className="p-4 bg-white h-100 cursor-pointer" style={styles.card} onClick={() => setActiveMenu("results")}>
                       <div className="d-flex justify-content-between align-items-center">
                          <div>
                             <div style={styles.labelText}>Exams Taken</div>
                             <h2 className="fw-bold mt-2">{stats.examsTaken}</h2>
                          </div>
                          <div className="bg-success bg-opacity-10 text-success p-4 rounded-circle"><FaBook size={24}/></div>
                       </div>
                    </div>
                  </div>

                  {/* Fees Card */}
                  <div className="col-md-4">
                    <div className="p-4 bg-white h-100 cursor-pointer" style={styles.card} onClick={() => setActiveMenu("fees")}>
                       <div className="d-flex justify-content-between align-items-center">
                          <div>
                             <div style={styles.labelText}>Fee Status</div>
                             <h2 className={`fw-bold mt-2 ${stats.feeStatus === 'PAID' ? 'text-success' : 'text-warning'}`}>
                                {stats.feeStatus}
                             </h2>
                          </div>
                          <div className="bg-warning bg-opacity-10 text-warning p-4 rounded-circle"><FaMoneyBillWave size={24}/></div>
                       </div>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* SUB-COMPONENTS */}
          {activeMenu === "attendance" && (
            <div style={styles.card} className="p-4">
               <StudentAttendance />
            </div>
          )}

          {activeMenu === "timetable" && (
            <div style={styles.card} className="p-4">
               <StudentTimetable />
            </div>
          )}

          {activeMenu === "results" && (
            <div style={styles.card} className="p-4">
               <StudentResults />
            </div>
          )}

          {activeMenu === "fees" && (
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div style={styles.card} className="p-5">
                  <div className="d-flex align-items-center mb-4 border-bottom pb-3">
                      <div className="bg-warning bg-opacity-10 text-warning p-3 rounded me-3"><FaFilePdf size={28}/></div>
                      <div>
                         <h5 className="fw-bold m-0">Fee Invoice & Status</h5>
                         <small className="text-muted">View your payment status and download receipts.</small>
                      </div>
                  </div>

                  {feeLoading ? (
                    <div className="text-center py-5 text-muted">Loading Fee Details...</div>
                  ) : fee ? (
                    <div className="card bg-light border-0 p-4">
                      <div className="row mb-3">
                        <div className="col-6"><small className="text-muted text-uppercase fw-bold">Student Name</small></div>
                        <div className="col-6 text-end fw-bold">{user?.name}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6"><small className="text-muted text-uppercase fw-bold">Class</small></div>
                        <div className="col-6 text-end fw-bold">{fee.classId?.name} - {fee.classId?.section}</div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-6"><small className="text-muted text-uppercase fw-bold">Total Amount</small></div>
                        <div className="col-6 text-end fw-bold fs-5">₹{fee.totalFee}</div>
                      </div>
                      <div className="row mb-4">
                        <div className="col-6"><small className="text-muted text-uppercase fw-bold">Payment Status</small></div>
                        <div className="col-6 text-end">
                          <span className={`badge ${fee.status === "PAID" ? "bg-success" : "bg-danger"} px-3 py-2`}>
                            {fee.status}
                          </span>
                        </div>
                      </div>
                      
                      {fee.status === "PAID" ? (
                        <button onClick={downloadReceipt} className="btn btn-primary w-100 py-2 fw-bold">
                           <FaDownload className="me-2"/> Download Receipt
                        </button>
                      ) : (
                        <div className="alert alert-warning text-center small m-0">
                          Please contact administration to clear pending dues.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <p className="text-muted">No fee records found for your account.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;