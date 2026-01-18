import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAssignFee() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await api.get("/api/admin/users");
      setStudents(res.data.filter((u) => u.role === "student"));
    };
    fetchStudents();
  }, []);

  const assignFee = async () => {
    if (!studentId) {
      alert("Select a student");
      return;
    }

    try {
      await api.post("/api/fees/assign", { studentId });
      alert("Fee assigned to student");
    } catch (error) {
      alert(error.response?.data?.message || "Error assigning fee");
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Fees / Assign Fee</div>

      <h3 className="fw-bold mb-4">Assign Fee to Student</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ maxWidth: "700px", borderRadius: "8px" }}
      >
        <div className="mb-3">
          <label className="form-label text-muted">Student</label>
          <select
            className="form-select"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3">
          <button className="btn btn-dark" onClick={assignFee}>
            Assign Fee
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAssignFee;
