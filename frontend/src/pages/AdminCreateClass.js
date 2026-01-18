import { useState } from "react";
import api from "../services/api";

function AdminCreateClass() {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/classes", {
        name,
        section,
        academicYear,
      });
      alert("Class created successfully");
      setName("");
      setSection("");
      setAcademicYear("");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating class");
    }
  };

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Classes / Create</div>

      <h3 className="fw-bold mb-4">Create New Class</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ borderRadius: "8px", maxWidth: "520px" }}
      >
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label">Class Name</label>
            <input
              className="form-control"
              placeholder="e.g. 10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Section</label>
            <input
              className="form-control"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Academic Year</label>
            <input
              className="form-control"
              placeholder="e.g. 2025-26"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-dark">
              Create Class
            </button>
            <button
              type="reset"
              className="btn btn-outline-secondary"
              onClick={() => {
                setName("");
                setSection("");
                setAcademicYear("");
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCreateClass;
