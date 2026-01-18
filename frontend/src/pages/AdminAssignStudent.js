import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAssignStudent() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const s = await api.get("/api/admin/users");
      const c = await api.get("/api/classes");
      setStudents(s.data.filter((u) => u.role === "student"));
      setClasses(c.data);
    };
    fetchData();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    await api.post("/api/classes/assign-student", {
      studentId,
      classId,
      rollNumber,
    });

    alert("Student assigned to class");
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Classes / Assign Student</div>

      <h3 className="fw-bold mb-4">Assign Student to Class</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ maxWidth: "800px", borderRadius: "8px" }}
      >
        <form onSubmit={submitHandler}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-muted">Student</label>
              <select
                className="form-select"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label text-muted">Class</label>
              <select
                className="form-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}-{c.section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-muted">Roll Number</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-dark">
              Assign Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminAssignStudent;
