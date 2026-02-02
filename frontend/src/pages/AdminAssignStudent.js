import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function AdminAssignStudent() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(""); // Changed from studentId
  const [selectedClass, setSelectedClass] = useState(""); // Changed from classId
  const [rollNumber, setRollNumber] = useState("");
  const { addToast } = useToast(); // Added useToast hook

  useEffect(() => {
    // Load Classes and Students (mock or real endpoint)
    api.get("/api/classes").then((res) => setClasses(res.data));
    api.get("/api/admin/users").then((res) => {
      setStudents(res.data.filter((u) => u.role === "student"));
    });
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/classes/assign-student", {
        studentId: selectedStudent, // Using selectedStudent
        classId: selectedClass, // Using selectedClass
        rollNumber,
      });
      addToast("Student assigned to class", "success"); // Replaced alert with addToast
      // Optionally clear form fields after successful assignment
      setSelectedStudent("");
      setSelectedClass("");
      setRollNumber("");
    } catch (err) {
      addToast("Failed to assign student", "error"); // Added error toast
    }
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
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
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
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
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
