import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAttendance() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await api.get("/api/admin/attendance");
      setRecords(res.data);
    };
    fetchReport();
  }, []);

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Attendance / Report</div>

      <h3 className="fw-bold mb-4">Attendance Report</h3>

      <div className="bg-white p-3 shadow-sm" style={{ borderRadius: "8px" }}>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Date</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>

            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.student?.name}</td>
                    <td>{r.student?.email}</td>
                    <td>{new Date(r.date).toDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "Present" ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>{r.markedBy?.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAttendance;
