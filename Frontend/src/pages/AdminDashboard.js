import React, { useState } from "react";
import "./Admin.css";
import Dashboard from "./Dashboard";
import ManageUsers from "./ManageUsers";
import ManageProducts from "./ManageProducts";
import Inventory from "./Inventory";
import Sales from "./Sales";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const userName = localStorage.getItem("userName") || "Administrator";
  const userEmail = localStorage.getItem("userEmail") || "";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "A";

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onViewAllSales={() => setActivePage("sales")} />;
      case "products":
        return <ManageProducts />;
      case "inventory":
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "users":
        return <ManageUsers />;
      default:
        return <Dashboard onViewAllSales={() => setActivePage("sales")} />;
    }
  };

  return (
    <div className="dashboard">
      {/* ===== SIDEBAR ===== */}
      <div className="sidebar">
        <div>
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">{userInitial}</div>
            <div className="sidebar-user-meta">
              <strong>{userName}</strong>
              <span>{userEmail}</span>
              <small>Admin</small>
            </div>
          </div>

          <ul>
            <li
              className={activePage === "dashboard" ? "active" : ""}
              onClick={() => setActivePage("dashboard")}
            >
              📊 Dashboard
            </li>

            <li
              className={activePage === "users" ? "active" : ""}
              onClick={() => setActivePage("users")}
            >
              👥 Manage Users
            </li>

            <li
              className={activePage === "products" ? "active" : ""}
              onClick={() => setActivePage("products")}
            >
              🏷️ Manage Products
            </li>

            <li
              className={activePage === "inventory" ? "active" : ""}
              onClick={() => setActivePage("inventory")}
            >
              📦 View Inventory
            </li>

            <li
              className={activePage === "sales" ? "active" : ""}
              onClick={() => setActivePage("sales")}
            >
              💰 View Sales Records
            </li>
          </ul>
        </div>

        <button
          className="logout-btnn"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* ===== MAIN AREA ===== */}
      <div className="main">
        {/* Page Content */}
        <div className="page-content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;
