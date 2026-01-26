import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/Loader";
import AlertMessage from "../components/AlertMessage";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { 
  FaTachometerAlt, FaUsers, FaMoneyBillWave, FaChalkboardTeacher, 
  FaClipboardCheck, FaBook, FaUpload, FaBullhorn, 
  FaUserGraduate, FaUserTie, FaBars, FaArrowLeft, FaEdit, FaTrash, FaPaperPlane,
  FaSearch, FaDownload, FaBookReader, FaTimes 
} from "react-icons/fa";

import LibraryDashboard from "./LibraryDashboard"; 

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);
  const [data, setData] = useState({ users: [], classes: [], fees: [], exams: [], notices: [], stats: {} }); 
  const [formData, setFormData] = useState({ roleFilter: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [alertInfo, setAlertInfo] = useState({ show: false, type: "", msg: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  const styles = {
    font: { fontFamily: "'Inter', sans-serif" },
    sidebar: { 
      backgroundColor: "#1e293b", minHeight: "100vh", color: "#f8fafc",
      width: showSidebar ? "260px" : "0px",
      position: window.innerWidth < 768 ? "fixed" : "relative",
      zIndex: 1050, overflow: "hidden", transition: "width 0.3s" 
    },
    backdrop: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040,
      display: (window.innerWidth < 768 && showSidebar) ? "block" : "none"
    },
    main: { backgroundColor: "#f1f5f9", minHeight: "100vh" },
    card: { border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", background: "white" },
    headerText: { color: "#334155", fontWeight: "700" },
    labelText: { color: "#64748b", fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
    tableHeader: { backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase" },
    menuBtn: (isActive) => ({
      backgroundColor: isActive ? "#3b82f6" : "transparent",
      color: isActive ? "white" : "#cbd5e1",
      border: "none", padding: "12px 16px", width: "100%", textAlign: "left",
      borderRadius: "8px", marginBottom: "4px", fontSize: "0.95rem", fontWeight: "500",
      transition: "all 0.2s"
    }),
    chartContainer: { height: "220px", position: "relative" }
  };

  const chartData = {
    att: { labels: ["Present", "Absent"], datasets: [{ data: [data.stats.attendancePercentage || 0, 100-(data.stats.attendancePercentage||0)], backgroundColor: ["#10b981", "#ef4444"], borderWidth: 0 }] },
    fee: { labels: ["Collected", "Pending"], datasets: [{ label: "Amount (₹)", data: [data.stats.fees?.collected || 0, data.stats.fees?.pending || 0], backgroundColor: ["#3b82f6", "#f59e0b"], borderRadius: 4, barThickness: 30 }] }
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
    const loadData = async () => {
      const results = await Promise.allSettled([
        api.get("/api/admin/users"), api.get("/api/classes"), api.get("/api/dashboard/admin"),
        api.get("/api/fees/student-fees"), api.get("/api/exams"), api.get("/api/notices")
      ]);
      setData({
        users: results[0].status === 'fulfilled' ? results[0].value.data : [],
        classes: results[1].status === 'fulfilled' ? results[1].value.data : [],
        stats: results[2].status === 'fulfilled' ? results[2].value.data : {},
        fees: results[3].status === 'fulfilled' ? results[3].value.data : [],
        exams: results[4].status === 'fulfilled' ? results[4].value.data : [],
        notices: results[5].status === 'fulfilled' ? results[5].value.data : [] 
      });
      setLoading(false);
    };
    loadData();
  }, [refreshKey]);

  const showAlert = (type, msg) => { setAlertInfo({ show: true, type, msg }); setTimeout(() => setAlertInfo({ show: false }), 3000); };
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const apiAction = async (method, url, payload, successMsg, menuRedirect) => {
    try {
      await api[method](url, payload);
      showAlert("success", successMsg);
      if(menuRedirect) setActiveMenu(menuRedirect);
      setRefreshKey(k => k + 1);
    } catch(err) { showAlert("danger", err.response?.data?.message || "Action Failed"); }
  };

  const downloadReceipt = async (studentId, studentName) => {
    try {
      const res = await api.get(`/api/fees/receipt/${studentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const safeName = studentName ? studentName.replace(/\s+/g, '_') : 'Student';
      link.setAttribute('download', `Receipt_${safeName}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) { showAlert("danger", "Failed to download receipt"); }
  };

  const filteredUsers = (data.users || []).filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.rollNumber && u.rollNumber.toString().includes(searchTerm));
    const matchesRole = formData.roleFilter === "all" || u.role === formData.roleFilter;
    return matchesSearch && matchesRole;
  });

  const BackBtn = ({ to }) => (
    <button className="btn btn-sm btn-light text-muted fw-bold mb-4 border" onClick={() => { setActiveMenu(to); setFormData({roleFilter: "all"}); }}>
      <FaArrowLeft className="me-2"/> Back
    </button>
  );

  if (loading) return <Loader text="Loading ERP System..." />;

  return (
    <div className="d-flex" style={styles.font}>
      <div style={styles.backdrop} onClick={() => setShowSidebar(false)} />
      <div className={`p-3`} style={styles.sidebar}>
        <div className="d-flex align-items-center justify-content-between mb-5 px-2">
           <div className="d-flex align-items-center">
             <div className="bg-primary rounded p-2 me-2"><FaUserGraduate size={20} color="white"/></div>
             <h5 className="mb-0 fw-bold text-white">ESchool ERP</h5>
           </div>
           <button className="btn btn-sm text-white d-md-none" onClick={() => setShowSidebar(false)}><FaTimes /></button>
        </div>
        {[
          { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
          { id: "users", label: "User Management", icon: FaUsers },
          { id: "classes", label: "Academics", icon: FaChalkboardTeacher },
          { id: "fees", label: "Finance & Fees", icon: FaMoneyBillWave },
          { id: "library", label: "Library Hub", icon: FaBookReader },
          { id: "exams", label: "Examinations", icon: FaBook },
          { id: "timetable", label: "Timetable", icon: FaClipboardCheck },
          { id: "notices", label: "Notice Board", icon: FaBullhorn }, 
          { id: "bulk", label: "Bulk Upload", icon: FaUpload },
        ].map((m) => (
          <button key={m.id} style={styles.menuBtn(activeMenu.startsWith(m.id))} onClick={() => { setActiveMenu(m.id); setFormData({roleFilter: "all"}); if(window.innerWidth < 768) setShowSidebar(false); }}>
            <m.icon className="me-3" style={{opacity: 0.8}} /> {m.label}
          </button>
        ))}
      </div>

      <div className="flex-grow-1" style={styles.main}>
        <div className="bg-white px-4 py-3 d-flex justify-content-between align-items-center border-bottom sticky-top shadow-sm">
          <div className="d-flex align-items-center">
             <button className="btn btn-light me-3" onClick={() => setShowSidebar(!showSidebar)}><FaBars/></button>
             <h5 className="mb-0" style={styles.headerText}>{activeMenu.split("-")[0].toUpperCase()}</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
             <div className="text-end d-none d-sm-block lh-1 me-2">
                <div className="fw-bold text-dark small">{user?.name}</div>
                <div className="text-muted" style={{fontSize:'10px'}}>ADMINISTRATOR</div>
             </div>
             <button onClick={logout} className="btn btn-outline-danger btn-sm rounded px-3">Logout</button>
          </div>
        </div>

        <div className="p-4" style={{height: 'calc(100vh - 70px)', overflowY: 'auto'}}>
           {alertInfo.show && <AlertMessage type={alertInfo.type} message={alertInfo.msg} onClose={() => setAlertInfo({show: false})} />}

           {activeMenu === "dashboard" && (
             <div className="fade-in">
                <div className="row g-4 mb-4">
                  {[
                    { t: "Students", v: data.stats.users?.students, c: "primary", i: FaUserGraduate },
                    { t: "Teachers", v: data.stats.users?.teachers, c: "success", i: FaUserTie },
                    { t: "Collected", v: `₹${data.stats.fees?.collected || 0}`, c: "info", i: FaMoneyBillWave },
                    { t: "Pending", v: `₹${data.stats.fees?.pending || 0}`, c: "warning", i: FaClipboardCheck }
                  ].map((s, i) => (
                    <div className="col-md-3" key={i}>
                      <div className="p-4" style={styles.card}>
                         <div className="d-flex justify-content-between">
                           <div><div style={styles.labelText}>{s.t}</div><h3 className="fw-bold mt-2">{s.v || 0}</h3></div>
                           <div className={`text-${s.c} bg-${s.c} bg-opacity-10 p-3 rounded`}><s.i size={20}/></div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="row g-4">
                   <div className="col-md-4"><div className="p-4 h-100" style={styles.card}><h6 className="fw-bold mb-4">Attendance</h6><div style={styles.chartContainer}><Doughnut data={chartData.att} options={{maintainAspectRatio:false}}/></div></div></div>
                   <div className="col-md-8"><div className="p-4 h-100" style={styles.card}><h6 className="fw-bold mb-4">Finance</h6><div style={styles.chartContainer}><Bar data={chartData.fee} options={{maintainAspectRatio:false}}/></div></div></div>
                </div>
             </div>
           )}

           {activeMenu === "library" && <LibraryDashboard />}

           {activeMenu === "users" && (
             <div className="fade-in">
                <div className="d-flex gap-2 mb-3">
                  {["all", "student", "teacher", "admin"].map(role => (
                    <button key={role} className={`btn btn-sm px-3 fw-bold ${formData.roleFilter === role ? 'btn-primary' : 'btn-light border'}`} onClick={() => setFormData({...formData, roleFilter: role})}>{role.toUpperCase()}S</button>
                  ))}
                </div>
                <div style={styles.card}>
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white flex-wrap gap-2">
                      <h6 className="fw-bold m-0 text-primary">List: {formData.roleFilter.toUpperCase()}</h6>
                      <div className="d-flex gap-2">
                          <div className="input-group input-group-sm" style={{width: '250px'}}>
                            <span className="input-group-text bg-light"><FaSearch className="text-muted"/></span>
                            <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                          </div>
                          <button className="btn btn-primary btn-sm px-3" onClick={() => setActiveMenu("users-create")}>+ Add User</button>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                          <thead style={styles.tableHeader}><tr><th className="ps-4">User</th><th>Roll No</th><th>Role</th><th>Email</th><th className="text-end pe-4">Actions</th></tr></thead>
                          <tbody>{filteredUsers.map(u => (
                              <tr key={u._id}><td className="ps-4 fw-medium">{u.name}</td><td className="fw-bold text-primary">{u.rollNumber || "-"}</td><td><span className={`badge bg-light text-dark border`}>{u.role.toUpperCase()}</span></td><td className="text-muted small">{u.email}</td><td className="text-end pe-4"><button className="btn btn-sm text-primary me-2" onClick={()=>{setFormData({...u, password:''}); setActiveMenu("users-edit")}}><FaEdit/></button><button className="btn btn-sm text-danger" onClick={()=>apiAction('delete', `/api/admin/users/${u._id}`, null, "Deleted", null)}><FaTrash/></button></td></tr>
                            ))}</tbody>
                      </table>
                    </div>
                </div>
             </div>
           )}

           {activeMenu === "classes" && (
              <div className="fade-in">
                 <div className="row g-4 mb-4">
                    <div className="col-md-6" onClick={()=>setActiveMenu("classes-create")}><div className="p-4 text-center cursor-pointer bg-white" style={styles.card}><FaChalkboardTeacher size={32} className="text-primary mb-3"/><h6 className="fw-bold">Create Class</h6><small className="text-muted d-block mt-1">Add new academic class</small></div></div>
                    <div className="col-md-6" onClick={()=>setActiveMenu("classes-assign")}><div className="p-4 text-center cursor-pointer bg-white" style={styles.card}><FaUsers size={32} className="text-success mb-3"/><h6 className="fw-bold">Assign Student</h6><small className="text-muted d-block mt-1">Enroll student to class</small></div></div>
                 </div>
                 <div style={styles.card}><div className="p-3 border-bottom bg-light"><h6 className="fw-bold m-0">Active Classes</h6></div><table className="table mb-0"><thead style={styles.tableHeader}><tr><th className="ps-4">Class</th><th>Section</th><th>Year</th></tr></thead><tbody>{(data.classes||[]).map(c=><tr key={c._id}><td className="ps-4 fw-bold">{c.name}</td><td>{c.section}</td><td>{c.academicYear}</td></tr>)}</tbody></table></div>
              </div>
           )}

           {activeMenu === "fees" && (
              <div className="row g-4 fade-in">
                {[ {t:"Create Structure", d: "Setup fee structure", m:"fees-create", i:FaMoneyBillWave}, {t:"Assign Fees", d: "Apply fee to student", m:"fees-assign", i:FaUserGraduate}, {t:"Payment History", d: "Track & update payments", m:"fees-view", i:FaClipboardCheck} ].map((x,i)=> (
                    <div className="col-md-4" key={i} onClick={()=>setActiveMenu(x.m)}><div className="p-4 text-center cursor-pointer bg-white" style={styles.card}><x.i size={28} className="text-primary mb-3"/><h6 className="fw-bold">{x.t}</h6><small className="text-muted d-block mt-1">{x.d}</small></div></div>
                ))}
              </div>
           )}

           {activeMenu === "fees-view" && (
              <div style={styles.card} className="fade-in">
                 <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light"><BackBtn to="fees"/><h6 className="fw-bold m-0">Fee Tracking</h6></div>
                 <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead style={styles.tableHeader}><tr><th className="ps-4">Student</th><th>Total</th><th>Paid</th><th>Status</th><th className="text-end pe-4">Action</th></tr></thead>
                        <tbody>{(data.fees||[]).map(f=>(
                            <tr key={f._id}><td className="ps-4 fw-bold">{f.studentId?.name}</td><td>₹{f.totalFee}</td><td>₹{f.paidAmount}</td><td><span className={`badge ${f.status==='PAID'?'bg-success':'bg-warning'}`}>{f.status}</span></td><td className="text-end pe-4">
                                {f.status!=='PAID' && <button className="btn btn-sm btn-outline-success me-2" onClick={()=>{const amt=prompt("Amount:"); if(amt) apiAction('put','/api/fees/pay',{studentId:f.studentId._id, paidAmount:Number(amt)},"Paid",null)}}>Pay</button>}
                                <button className="btn btn-sm btn-outline-primary" onClick={() => downloadReceipt(f.studentId?._id, f.studentId?.name)} title="Download Receipt"><FaDownload /></button>
                            </td></tr>
                        ))}</tbody>
                    </table>
                 </div>
              </div>
           )}

           {activeMenu === "exams" && (
             <div style={styles.card} className="fade-in">
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white"><h6 className="fw-bold m-0">Examination Schedule</h6><button className="btn btn-primary btn-sm" onClick={() => setActiveMenu("exams-create")}>+ New Exam</button></div>
                <div className="table-responsive"><table className="table mb-0"><thead style={styles.tableHeader}><tr><th className="ps-4">Name</th><th>Subject</th><th>Class</th><th>Date</th></tr></thead><tbody>{(data.exams||[]).map(e=><tr key={e._id}><td className="ps-4 fw-bold">{e.name}</td><td>{e.subject}</td><td>{e.classId?.name}-{e.classId?.section}</td><td>{new Date(e.examDate).toLocaleDateString()}</td></tr>)}</tbody></table></div>
             </div>
           )}

           {activeMenu === "timetable" && (
              <div className="row justify-content-center fade-in">
                 <div className="col-md-8"><div className="p-4 bg-white" style={styles.card}><h5 className="fw-bold mb-4 text-primary">Master Timetable Entry</h5>
                 <form onSubmit={(e)=>{e.preventDefault(); apiAction('post','/api/timetable',formData,"Timetable Updated",null)}}>
                   <div className="row mb-3">
                     <div className="col"><label style={styles.labelText}>Class</label><select className="form-select" name="classId" onChange={handleInputChange} required><option value="">Select...</option>{data.classes.map(c=><option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select></div>
                     <div className="col"><label style={styles.labelText}>Day</label><select className="form-select" name="day" onChange={handleInputChange}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d=><option key={d}>{d}</option>)}</select></div>
                   </div>
                   <div className="row mb-3">
                     <div className="col"><label style={styles.labelText}>Time</label><input className="form-control" name="timeSlot" placeholder="9:00 AM - 10:00 AM" onChange={handleInputChange} required/></div>
                     <div className="col"><label style={styles.labelText}>Subject</label><input className="form-control" name="subject" placeholder="Subject" onChange={handleInputChange} required/></div>
                   </div>
                   <div className="mb-4">
                     <label style={styles.labelText}>Teacher</label>
                     <select className="form-select" name="teacher" onChange={handleInputChange} required>
                       <option value="">Select Teacher...</option>
                       {data.users.filter(u=>u.role==='teacher').map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
                     </select>
                   </div>
                   <button className="btn btn-primary w-100 fw-bold">Save Entry</button>
                 </form></div></div>
              </div>
           )}

           {activeMenu === "notices" && (
             <div style={styles.card} className="p-4 fade-in">
                <h5 className="fw-bold mb-4">Admin Notice Board</h5>
                <form onSubmit={(e) => { e.preventDefault(); apiAction('post', '/api/notices', formData, "Notice Posted", "notices"); }}>
                  <div className="row g-3">
                    <div className="col-md-8"><input type="text" className="form-control" name="title" placeholder="Important Title" onChange={handleInputChange} required/></div>
                    <div className="col-md-4"><select className="form-select" name="audience" onChange={handleInputChange}><option value="all">Everyone</option><option value="teacher">Teachers</option><option value="student">Students</option></select></div>
                    <div className="col-12"><textarea className="form-control" name="content" rows="4" placeholder="Broadcast message content here..." onChange={handleInputChange} required></textarea></div>
                    <div className="col-12 text-end"><button className="btn btn-primary fw-bold"><FaPaperPlane className="me-2"/>Send Broadcast</button></div>
                  </div>
                </form>
             </div>
           )}

           {activeMenu === "bulk" && (
              <div className="row justify-content-center fade-in"><div className="col-md-6"><div className="p-5 text-center bg-white" style={styles.card}><FaUpload size={40} className="text-muted mb-3"/><h5 className="fw-bold">Bulk CSV Management</h5><form onSubmit={(e)=>{e.preventDefault(); if(!formData.file)return showAlert("warning","No File"); const d=new FormData(); d.append("file",formData.file); apiAction('post','/api/bulk-upload/students',d,"Data Uploaded",null)}}><input type="file" className="form-control mb-3" accept=".csv" onChange={(e)=>setFormData({...formData, file:e.target.files[0]})} required/><button className="btn btn-primary w-100 fw-bold">Upload to Database</button></form></div></div></div>
           )}

           {(activeMenu.includes("-create") || activeMenu.includes("-edit") || activeMenu.includes("-assign")) && (
              <div className="row justify-content-center fade-in">
                 <div className="col-md-6"><BackBtn to={activeMenu.split("-")[0]}/>
                    <div className="p-4 bg-white shadow" style={styles.card}>
                       <h5 className="fw-bold mb-4 border-bottom pb-3">{activeMenu.replace("-", " ").toUpperCase()}</h5>
                       {activeMenu.includes("users") && (
                          <form onSubmit={(e) => { e.preventDefault(); const isEdit = activeMenu.includes("edit"); apiAction(isEdit ? 'put' : 'post', isEdit ? `/api/admin/users/${formData._id}` : '/api/admin/users', formData, "Account Updated", "users") }}>
                              <label style={styles.labelText}>Full Name</label><input className="form-control mb-3" name="name" value={formData.name||''} onChange={handleInputChange} required />
                              <label style={styles.labelText}>Roll Number</label><input className="form-control mb-3" type="number" name="rollNumber" value={formData.rollNumber||''} onChange={handleInputChange} />
                              <label style={styles.labelText}>Email</label><input className="form-control mb-3" name="email" value={formData.email||''} onChange={handleInputChange} required />
                              <label style={styles.labelText}>Role</label><select className="form-select mb-4" name="role" value={formData.role||'student'} onChange={handleInputChange}><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select>
                              <button className="btn btn-primary w-100 fw-bold">Save User</button>
                          </form>
                       )}
                       {activeMenu === "classes-create" && (
                         <form onSubmit={(e)=>{e.preventDefault(); apiAction('post', '/api/classes', formData, "Class Created", "classes")}}>
                            <label style={styles.labelText}>Class Name</label><input className="form-control mb-3" name="name" placeholder="e.g. 10th Standard" onChange={handleInputChange} required /><label style={styles.labelText}>Section</label><input className="form-control mb-3" name="section" placeholder="e.g. A" onChange={handleInputChange} required /><label style={styles.labelText}>Academic Year</label><input className="form-control mb-4" name="academicYear" placeholder="2024-25" onChange={handleInputChange} required /><button className="btn btn-primary w-100 fw-bold">Create Class</button>
                         </form>
                       )}
                       {activeMenu === "classes-assign" && (
                         <form onSubmit={(e)=>{e.preventDefault(); apiAction('post','/api/classes/assign-student',formData,"Student Assigned","classes")}}>
                            <label style={styles.labelText}>Select Student</label><select className="form-select mb-3" name="studentId" onChange={handleInputChange} required><option value="">Choose...</option>{data.users.filter(u=>u.role==='student').map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select>
                            <label style={styles.labelText}>Target Class</label><select className="form-select mb-3" name="classId" onChange={handleInputChange} required><option value="">Choose...</option>{data.classes.map(c=><option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select>
                            <label style={styles.labelText}>Roll Number</label><input className="form-control mb-4" name="rollNumber" placeholder="Assigned Roll No" onChange={handleInputChange} required /><button className="btn btn-primary w-100 fw-bold">Assign Student</button>
                         </form>
                       )}
                       {activeMenu === "fees-create" && (
                          <form onSubmit={(e)=>{e.preventDefault(); apiAction('post','/api/fees',{...formData, totalFee:Number(formData.totalFee)},"Structure Created","fees")}}>
                            <label style={styles.labelText}>Class</label><select className="form-select mb-3" name="classId" onChange={handleInputChange} required><option value="">Select...</option>{data.classes.map(c=><option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select>
                            <label style={styles.labelText}>Total Amount</label><input type="number" className="form-control mb-4" name="totalFee" onChange={handleInputChange} required /><button className="btn btn-primary w-100 fw-bold">Save Structure</button>
                          </form>
                       )}
                       {activeMenu === "fees-assign" && (
                          <form onSubmit={(e)=>{e.preventDefault(); apiAction('post','/api/fees/assign',formData,"Fee Assigned","fees")}}>
                            <label style={styles.labelText}>Student</label><select className="form-select mb-4" name="studentId" onChange={handleInputChange} required><option value="">Select...</option>{(data.users||[]).filter(u=>u.role==='student').map(s=><option key={s._id} value={s._id}>{s.name}</option>)}</select>
                            <button className="btn btn-primary w-100">Assign Fee</button>
                          </form>
                       )}
                       {activeMenu === "exams-create" && (
                         <form onSubmit={(e)=>{e.preventDefault(); apiAction('post','/api/exams',formData,"Exam Created","exams")}}><label style={styles.labelText}>Exam Name</label><input className="form-control mb-3" name="name" placeholder="Mid Term" onChange={handleInputChange} required /><label style={styles.labelText}>Subject</label><input className="form-control mb-3" name="subject" onChange={handleInputChange} required /><label style={styles.labelText}>Class</label><select className="form-select mb-3" name="classId" onChange={handleInputChange} required><option value="">Select Class...</option>{data.classes.map(c=><option key={c._id} value={c._id}>{c.name}-{c.section}</option>)}</select><label style={styles.labelText}>Date</label><input type="date" className="form-control mb-3" name="examDate" onChange={handleInputChange} required /><label style={styles.labelText}>Marks</label><input type="number" className="form-control mb-4" name="totalMarks" onChange={handleInputChange} required /><button className="btn btn-primary w-100 fw-bold">Schedule Exam</button></form>
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

export default AdminDashboard;