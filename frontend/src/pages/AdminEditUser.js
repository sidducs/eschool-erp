import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function AdminEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [role, setRole] = useState("");
  const [section, setSection] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/admin/users");
        const user = res.data.find((u) => u._id === id);

        if (user) {
          setRole(user.role);
          setSection(user.section || "");
          setRollNumber(user.rollNumber || "");
        }
      } catch (err) {
        console.error("Failed to load user", err);
        addToast("Failed to load user data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, addToast]);

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
    try {
      await api.put(`/api/admin/users/${id}`, {
        role,
        section: role === "student" ? section : "",
        rollNumber: role === "student" ? rollNumber : "",
      });

      addToast("User updated successfully", "success");
      navigate("/admin");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update user", "error");
    }
  };

  if (loading) {
    return <div className="p-4 flex items-center justify-center">Loading...</div>;
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
            <label className="form-label font-semibold">Role</label>
            <select
              className="form-select border-slate-200"
              value={role}
              onChange={handleRoleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          {role === "student" && (
            <>
              <div className="mb-3">
                <label className="form-label font-semibold">Section</label>
                <input
                  className="form-control border-slate-200"
                  placeholder="Enter Section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label font-semibold">Roll Number</label>
                <input
                  type="number"
                  className="form-control border-slate-200"
                  placeholder="Enter Roll Number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary fw-bold">
              Update User
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
