import { useEffect, useState } from "react";
import api from "../services/api";

function AdminClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await api.get("/api/classes");
      setClasses(res.data);
    };
    fetchClasses();
  }, []);

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Classes</div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Class List</h3>
      </div>

      <div className="bg-white p-3 shadow-sm" style={{ borderRadius: "8px" }}>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Class</th>
                <th>Section</th>
                <th>Academic Year</th>
              </tr>
            </thead>

            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No classes found.
                  </td>
                </tr>
              ) : (
                classes.map((c) => (
                  <tr key={c._id}>
                    <td className="fw-semibold">{c.name}</td>
                    <td>{c.section}</td>
                    <td>{c.academicYear}</td>
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

export default AdminClasses;
