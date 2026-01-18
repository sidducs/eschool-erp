import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/users/profile");
        setUser(res.data);
      } catch (err) {
        setError("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return (
      <div
        className="container-fluid p-4"
        style={{ background: "#f4f6f9", minHeight: "100vh" }}
      >
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="container-fluid p-4"
        style={{ background: "#f4f6f9", minHeight: "100vh" }}
      >
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid p-4"
      style={{ background: "#f4f6f9", minHeight: "100vh" }}
    >
      <div className="mb-2 text-muted">
        {user.role.charAt(0).toUpperCase() + user.role.slice(1)} / Dashboard
      </div>

      <h3 className="fw-bold mb-4">Welcome, {user.name}</h3>

      <div
        className="bg-white p-4 shadow-sm"
        style={{ borderRadius: "8px", maxWidth: "600px" }}
      >
        <div className="row mb-3">
          <div className="col-4 text-muted">Name</div>
          <div className="col-8 fw-semibold">{user.name}</div>
        </div>

        <div className="row mb-3">
          <div className="col-4 text-muted">Email</div>
          <div className="col-8 fw-semibold">{user.email}</div>
        </div>

        <div className="row">
          <div className="col-4 text-muted">Role</div>
          <div className="col-8">
            <span className="badge bg-primary text-uppercase">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
