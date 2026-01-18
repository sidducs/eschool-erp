import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await api.get("/api/admin/users");
      const user = res.data.find((u) => u._id === id);

      if (user) {
        setRole(user.role);
        setSection(user.section || "");
        setRollNumber(user.rollNumber || "");
      }

      setLoading(false);
    };

    fetchUser();
  }, [id]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);

    // If role is not student, clear student-only fields
    if (newRole !== "student") {
      setSection("");
      setRollNumber("");
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    await api.put(`/api/admin/users/${id}`, {
      role,
      section: role === "student" ? section : "",
      rollNumber: role === "student" ? rollNumber : "",
    });

    alert("User updated");
    navigate("/admin");
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">Admin / Users / Edit</div>

      <h3 className="fw-bold mb-4">Edit User</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ borderRadius: "8px", maxWidth: "500px" }}
      >
        <form onSubmit={submitHandler}>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={handleRoleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === "student" && (
            <>
              <div className="mb-3">
                <label className="form-label">Section</label>
                <input
                  className="form-control"
                  placeholder="Enter Section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Roll Number</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter Roll Number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              Update
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate("/admin")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEditUser;
