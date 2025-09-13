// components/Navigation/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, User, Settings, LogOut } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <Activity size={24} />
          <span>TeleRadiology</span>
        </Link>
      </div>

      <div className="navbar-nav">
        <Link
          to="/dashboard"
          className={`nav-link ${
            location.pathname === "/dashboard" || location.pathname === "/"
              ? "active"
              : ""
          }`}
        >
          Dashboard
        </Link>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <User size={20} />
          <span>Dr. Radiologist</span>
        </div>

        <div className="user-actions">
          <button className="icon-button" title="Settings">
            <Settings size={18} />
          </button>
          <button className="icon-button" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
