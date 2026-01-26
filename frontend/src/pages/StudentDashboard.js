import { useState, useContext, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Sub-components
import StudentAttendance from "../pages/StudentAttendance"; 
import StudentTimetable from "../pages/StudentTimetable";   
import StudentResults from "../pages/StudentResults";       
import LibraryDashboard from "../pages/LibraryDashboard"; 

import {
  FaBars, FaTachometerAlt, FaClipboardCheck, FaBook, FaCalendarAlt,
  FaFilePdf, FaUserGraduate, FaDownload, FaBullhorn,
  FaBookReader, FaTimes
} from "react-icons/fa";

function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    attendancePercent: 0,
    examsTaken: 0,
    feeStatus: "Pending"
  });
  
  const [notices, setNotices] = useState([]);
  const [fee, setFee] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const styles = {
    font: { fontFamily: "'Inter', sans-serif" },
    sidebar: (show) => ({
      backgroundColor: "#1e293b",
      minHeight: "100vh",
      color: "#f8fafc",
      width: "260px",
      position: window.innerWidth < 768 ? "fixed" : "relative",
      left: 0, top: 0, bottom: 0,
      zIndex: 1050,
      transition: "transform 0.3s ease",
      transform: (window.innerWidth < 768 && !show) ? "translateX(-100%)" : "translateX(0)",
      flexShrink: 0,
    }),
    main: { backgroundColor: "#f1f5f9", minHeight: "100vh", width: "100%", overflowX: "hidden" },
    backdrop: {
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 1040,
      display: (window.innerWidth < 768 && showSidebar) ? "block" : "none"
    },
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setShowSidebar(true);
      else setShowSidebar(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [attendanceRes, resultsRes, feeRes, noticesRes] = await Promise.allSettled([
          api.get("/api/attendance/me"), api.get("/api/results/student"),
          api.get("/api/fees/my-fee"), api.get("/api/notices")
        ]);
        setStats({
          attendancePercent: attendanceRes.status === "fulfilled" ? (attendanceRes.value.data?.percentage || 0) : 0,
          examsTaken: resultsRes.status === "fulfilled" ? (resultsRes.value.data?.length || 0) : 0,
          feeStatus: feeRes.status === "fulfilled" ? (feeRes.value.data?.status || "Pending") : "Pending"
        });
        if (noticesRes.status === "fulfilled") setNotices(noticesRes.value.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeMenu === "fees") {
      const loadFees = async () => {
        try {
          setFeeLoading(true);
          const res = await api.get("/api/fees/my-fee");
          setFee(res.data);
        } catch { setFee(null); } finally { setFeeLoading(false); }
      };
      loadFees();
    }
  }, [activeMenu]);

  const downloadReceipt = async () => {
    try {
      const res = await api.get("/api/fees/receipt/my", { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${user?.name?.replace(/\s+/g, '_')}_Receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { alert("Failed to download receipt"); }
  };

  const menus = [
    { id: "dashboard", label: "Overview", icon: FaTachometerAlt },
    { id: "attendance", label: "Attendance", icon: FaClipboardCheck },
    { id: "timetable", label: "Timetable", icon: FaCalendarAlt },
    { id: "results", label: "Results", icon: FaBook },
    { id: "library", label: "Library Hub", icon: FaBookReader },
    { id: "fees", label: "Fees & Invoice", icon: FaFilePdf },
  ];

  if (loading) return <div className="p-5 text-center">Loading Student Portal...</div>;

  return (
    <div className="d-flex w-100" style={styles.font}>
      <div style={styles.backdrop} onClick={() => setShowSidebar(false)} />

      <div style={styles.sidebar(showSidebar)} className="p-3 shadow">
        <div className="d-flex align-items-center justify-content-between mb-5 px-2">
           <div className="d-flex align-items-center">
              <div className="bg-primary rounded p-2 me-2"><FaUserGraduate size={20} color="white"/></div>
              <h5 className="mb-0 fw-bold text-white">Student Portal</h5>
           </div>
           <button className="btn btn-sm text-white d-md-none" onClick={() => setShowSidebar(false)}><FaTimes /></button>
        </div>
        {menus.map((m) => (
          <button key={m.id} style={styles.menuBtn(activeMenu === m.id)} 
            onClick={() => {
              setActiveMenu(m.id);
              if(window.innerWidth < 768) setShowSidebar(false);
            }}>
            <m.icon className="me-3" /> {m.label}
          </button>
        ))}
      </div>

      <div className="flex-grow-1" style={styles.main}>
        <div className="bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom sticky-top shadow-sm">
          <div className="d-flex align-items-center">
             <button className="btn btn-light me-3" onClick={() => setShowSidebar(!showSidebar)}><FaBars/></button>
             <h5 className="mb-0 fw-bold text-primary">{activeMenu.toUpperCase()}</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
             <div className="text-end d-none d-sm-block lh-1">
                <div className="fw-bold text-dark small">{user?.name}</div>
                <div className="text-muted" style={{fontSize:'10px'}}>STUDENT</div>
             </div>
             <button onClick={logout} className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">Logout</button>
          </div>
        </div>

        <div className="p-4" style={{height: 'calc(100vh - 70px)', overflowY: 'auto'}}>
          {activeMenu === "dashboard" && (
             <div className="fade-in">
               <div className="row g-4 mb-4">
                 <div className="col-md-4"><div className="p-4 card border-0 shadow-sm" style={styles.card}><div style={styles.labelText}>Attendance</div><h3 className="fw-bold mt-2 text-primary">{stats.attendancePercent}%</h3></div></div>
                 <div className="col-md-4"><div className="p-4 card border-0 shadow-sm" style={styles.card}><div style={styles.labelText}>Exams Taken</div><h3 className="fw-bold mt-2">{stats.examsTaken}</h3></div></div>
                 <div className="col-md-4"><div className="p-4 card border-0 shadow-sm" style={styles.card}><div style={styles.labelText}>Fee Status</div><h3 className={`fw-bold mt-2 ${stats.feeStatus === "PAID" ? "text-success" : "text-warning"}`}>{stats.feeStatus}</h3></div></div>
               </div>
               <div className="p-4 bg-white rounded border shadow-sm">
                 <h6 className="fw-bold mb-3"><FaBullhorn className="me-2 text-primary"/>Recent Notices</h6>
                 {notices.map((n, i) => (
                   <div key={i} className="mb-3 p-3 border-start border-primary border-4 bg-light rounded shadow-sm"><div className="fw-bold">{n.title}</div><small className="text-muted">{n.content}</small></div>
                 ))}
               </div>
             </div>
          )}
          {activeMenu === "attendance" && <StudentAttendance />}
          {activeMenu === "timetable" && <StudentTimetable />}
          {activeMenu === "results" && <StudentResults />}
          {activeMenu === "library" && <LibraryDashboard />}
          {activeMenu === "fees" && (
             <div className="bg-white p-4 rounded border shadow-sm">
               {feeLoading ? <p>Loading Fee Details...</p> : (
                 <>
                   <div className="d-flex justify-content-between align-items-center mb-4">
                     <h5 className="fw-bold">My Fee Statement</h5>
                     {fee?.status === "PAID" && <button className="btn btn-primary btn-sm" onClick={downloadReceipt}><FaDownload className="me-2"/> Receipt</button>}
                   </div>
                   {fee ? <div className="row g-3"><div className="col-md-6 border p-3 rounded bg-light">Total Fee: ₹{fee.totalFee}</div><div className="col-md-6 border p-3 rounded bg-light text-success">Paid Amount: ₹{fee.paidAmount}</div></div> : <p>No records found.</p>}
                 </>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;