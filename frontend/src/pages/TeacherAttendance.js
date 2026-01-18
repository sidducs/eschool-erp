import { useEffect, useState } from "react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";

function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState("");
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await api.get("/api/classes");
      setClasses(res.data);
    };
    fetchClasses();
  }, []);

  const loadStudents = async (id) => {
    setClassId(id);
    setAttendance({});
    const res = await api.get(`/api/classes/${id}/students`);
    setStudents(res.data);
  };

  const markStatus = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const submitAttendance = async () => {
    if (!classId || !date) {
      alert("Please select class and date");
      return;
    }

    for (const studentId in attendance) {
      await api.post("/api/attendance", {
        studentId,
        classId,
        date,
        status: attendance[studentId],
      });
    }

    alert("Attendance submitted successfully");
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Teacher / Attendance</div>
      <h3 className="fw-bold mb-4">Class-wise Attendance</h3>

      <div
        className="bg-white shadow-sm p-4 mb-4"
        style={{ borderRadius: "8px", maxWidth: "640px" }}
      >
        <div className="mb-3">
          <label className="form-label text-muted">Class</label>
          <select
            className="form-select"
            onChange={(e) => loadStudents(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section} ({c.academicYear})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label text-muted">Date</label>
          <input
            type="date"
            className="form-control"
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="No students are assigned to this class yet."
        />
      ) : (
        <div
          className="bg-white shadow-sm p-4"
          style={{ borderRadius: "8px" }}
        >
          <div className="table-responsive">
            <table className="table table-bordered align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th width="80">Roll</th>
                  <th>Name</th>
                  <th width="220">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.rollNumber}</td>
                    <td>{s.name}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className={`btn btn-sm ${
                            attendance[s._id] === "Present"
                              ? "btn-success"
                              : "btn-outline-success"
                          }`}
                          onClick={() => markStatus(s._id, "Present")}
                        >
                          Present
                        </button>

                        <button
                          className={`btn btn-sm ${
                            attendance[s._id] === "Absent"
                              ? "btn-danger"
                              : "btn-outline-danger"
                          }`}
                          onClick={() => markStatus(s._id, "Absent")}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-end mt-3">
            <button
              onClick={submitAttendance}
              style={{
                background: "#000",
                color: "#fff",
                border: "1px solid #000",
                padding: "8px 16px",
                borderRadius: "6px",
              }}
            >
              Submit Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAttendance;
