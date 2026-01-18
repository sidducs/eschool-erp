import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function BootstrapNavbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav
      className="d-flex justify-content-between align-items-center px-4"
      style={{
        height: "56px",
        backgroundColor: "#000",
        color: "#fff",
        borderBottom: "1px solid #222",
      }}
    >
      <span style={{ fontWeight: "600", fontSize: "18px" }}>
        ESchool ERP
      </span>

      <div className="d-flex align-items-center gap-3">
        <span style={{ color: "#bbb", textTransform: "capitalize" }}>
          {user?.role}
        </span>

        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid #fff",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default BootstrapNavbar;
