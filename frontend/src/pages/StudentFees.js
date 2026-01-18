import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import {
  FaBars,
  FaTachometerAlt,
  FaClipboardCheck,
  FaBook,
  FaCalendarAlt,
  FaFilePdf,
  FaSignOutAlt,
} from "react-icons/fa";

function StudentDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showMenu, setShowMenu] = useState(true);

  const [fee, setFee] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const loadMyFee = async () => {
    try {
      setFeeLoading(true);
      const res = await api.get("/api/fees/my");
      setFee(res.data);
    } catch {
      setFee(null);
    } finally {
      setFeeLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const res = await api.get(`/api/fees/receipt/${user._id}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "my-fee-receipt.pdf";
      link.click();
    } catch {
      alert("Failed to download receipt");
    }
  };

  const MenuButton = ({ icon: Icon, label, name, onClick }) => (
    <button
      type="button"
      className={`btn w-100 text-start mb-2 ${
        activeMenu === name ? "btn-secondary" : "btn-dark"
      }`}
      onClick={onClick}
    >
      <Icon className="me-2" />
      {label}
    </button>
  );

  return (
    <div className="container-fluid p-0">
      {/* HEADER */}
      <div className="row bg-black text-white align-items-center px-3 py-2 m-0">
        <div className="col-auto d-md-none">
          <FaBars
            style={{ cursor: "pointer" }}
            onClick={() => setShowMenu(!showMenu)}
          />
        </div>
        <div className="col fw-bold">ESchool ERP</div>
        <div className="col text-end">
          <button
            type="button"
            className="btn btn-sm btn-outline-light"
            onClick={logout}
          >
            <FaSignOutAlt className="me-1" />
            Logout
          </button>
        </div>
      </div>

      <div className="row min-vh-100 m-0">
        {/* SIDEBAR */}
        {showMenu && (
          <div className="col-md-2 bg-dark text-white p-3">
            <MenuButton
              icon={FaTachometerAlt}
              label="Dashboard"
              name="dashboard"
              onClick={() => setActiveMenu("dashboard")}
            />
            <MenuButton
              icon={FaClipboardCheck}
              label="Attendance"
              name="attendance"
              onClick={() => navigate("/student/attendance")}
            />
            <MenuButton
              icon={FaCalendarAlt}
              label="Timetable"
              name="timetable"
              onClick={() => navigate("/student/timetable")}
            />
            <MenuButton
              icon={FaBook}
              label="Results"
              name="results"
              onClick={() => navigate("/student/results")}
            />
            <MenuButton
              icon={FaFilePdf}
              label="Fee Details"
              name="fees"
              onClick={() => {
                setActiveMenu("fees");
                loadMyFee();
              }}
            />
          </div>
        )}

        {/* CONTENT */}
        <div
          className="col-md-10 p-4"
          style={{ background: "#f4f6f9", minHeight: "100vh" }}
        >
          {activeMenu === "dashboard" && (
            <>
              <div className="mb-2 text-muted">Student / Dashboard</div>
              <h3 className="fw-bold mb-4">Student Dashboard</h3>

              <div className="row g-3">
                <div className="col-md-4">
                  <div
                    className="bg-white p-4 shadow-sm h-100"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                    onClick={() => navigate("/student/attendance")}
                  >
                    <h5 className="fw-semibold">My Attendance</h5>
                    <p className="text-muted mb-0">
                      View your daily attendance records.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="bg-white p-4 shadow-sm h-100"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                    onClick={() => navigate("/student/results")}
                  >
                    <h5 className="fw-semibold">Exam Results</h5>
                    <p className="text-muted mb-0">
                      Check your exam marks and performance.
                    </p>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="bg-white p-4 shadow-sm h-100"
                    style={{ borderRadius: "8px", cursor: "pointer" }}
                    onClick={() => {
                      setActiveMenu("fees");
                      loadMyFee();
                    }}
                  >
                    <h5 className="fw-semibold">Fee Details</h5>
                    <p className="text-muted mb-0">
                      View and download your fee receipt.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeMenu === "fees" && (
            <>
              <div className="mb-2 text-muted">Student / Fees</div>
              <h3 className="fw-bold mb-4">My Fee Details</h3>

              {feeLoading && <div>Loading...</div>}

              {!feeLoading && !fee && (
                <div className="alert alert-info">No fee assigned yet.</div>
              )}

              {!feeLoading && fee && (
                <div
                  className="bg-white shadow-sm p-4"
                  style={{ maxWidth: 640, borderRadius: 8 }}
                >
                  <div className="row mb-3">
                    <div className="col-5 text-muted">Class</div>
                    <div className="col-7 fw-semibold">
                      {fee.classId?.name} {fee.classId?.section}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-5 text-muted">Total Fee</div>
                    <div className="col-7 fw-semibold">
                      Rs. {fee.totalFee}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-5 text-muted">Paid</div>
                    <div className="col-7 fw-semibold">
                      Rs. {fee.paidAmount}
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-5 text-muted">Status</div>
                    <div className="col-7">
                      <span
                        className={`badge ${
                          fee.status === "PAID"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-dark" onClick={downloadReceipt}>
                    Download Receipt
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
