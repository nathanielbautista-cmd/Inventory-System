import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FaBoxes, FaCashRegister, FaSignOutAlt } from "react-icons/fa";
import "./StaffDashboard.css";

const MODULE_CONFIG = {
  inventory: {
    path: "/inventory",
    title: "Inventory Audit",
    subtitle: "Inventory Staff ",
    Icon: FaBoxes,
  },
  cashier: {
    path: "/pos",
    title: "Point of Sale",
    subtitle: "Cashier ",
    Icon: FaCashRegister,
  },
};

function StaffDashboard() {
  const location = useLocation();
  const rawRole = (localStorage.getItem("role") || "").trim().toLowerCase();
  const role = rawRole === "staff" ? "inventory" : rawRole;
  const userName = localStorage.getItem("userName") || "Staff Member";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "S";

  if (role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role !== "inventory" && role !== "cashier") {
    return <Navigate to="/" replace />;
  }

  const activeModule = location.pathname.startsWith("/inventory")
    ? "inventory"
    : location.pathname.startsWith("/pos")
    ? "cashier"
    : null;

  if (!activeModule || activeModule !== role) {
    return <Navigate to={MODULE_CONFIG[role].path} replace />;
  }

  const { title, subtitle, Icon } = MODULE_CONFIG[role];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="staff-app fade-in">
      <nav className="staff-side-nav">
        <div className="staff-sidebar-top">
          <div className="staff-user-card">
            <div className="staff-user-avatar">{userInitial}</div>
            <div className="staff-user-meta">
              <strong>{userName}</strong>
              <span>{userEmail || "No email available"}</span>
              <small>{subtitle}</small>
            </div>
          </div>

          <div className="staff-sidebar-section">
            <span className="staff-sidebar-label">Assigned Module</span>
            <div className="staff-module-card">
              <div className="staff-module-icon">
                <Icon />
              </div>
              <div className="staff-module-copy">
                <strong>{title}</strong>
                <span>{subtitle}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="staff-sidebar-footer">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}

export default StaffDashboard;
