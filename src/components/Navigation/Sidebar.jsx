// components/Navigation/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Calendar,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  Archive,
} from "lucide-react";

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      badge: null,
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      path: "/patients",
      badge: "12",
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      path: "/reports",
      badge: null,
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Calendar,
      path: "/schedule",
      badge: null,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      badge: null,
    },
    {
      id: "archive",
      label: "Archive",
      icon: Archive,
      path: "/archive",
      badge: null,
    },
  ];

  const bottomItems = [
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      path: "/help",
    },
  ];

  const isActive = (path) => {
    if (
      path === "/dashboard" &&
      (location.pathname === "/" || location.pathname === "/dashboard")
    ) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarItem = ({ item, isBottom = false }) => (
    <div
      className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <Link to={item.path} className="sidebar-link">
        <div className="sidebar-icon">
          <item.icon size={20} />
        </div>

        {!isCollapsed && <span className="sidebar-label">{item.label}</span>}

        {!isCollapsed && item.badge && (
          <span className="sidebar-badge">{item.badge}</span>
        )}

        {isCollapsed && hoveredItem === item.id && (
          <div className="sidebar-tooltip">
            {item.label}
            {item.badge && <span className="tooltip-badge">{item.badge}</span>}
          </div>
        )}
      </Link>
    </div>
  );

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Activity size={24} className="brand-icon" />
          {!isCollapsed && <span className="brand-text">TeleRadiology</span>}
        </div>

        <button
          className="sidebar-toggle"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            {menuItems.map((item) => (
              <SidebarItem key={item.id} item={item} />
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-section">
            {bottomItems.map((item) => (
              <SidebarItem key={item.id} item={item} isBottom={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
