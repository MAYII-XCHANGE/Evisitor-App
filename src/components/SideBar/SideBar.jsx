import { NavLink } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";
import { getNavigationForRole } from "../../config/navigation";
import { ROLE_LABELS } from "../../config/roles";
import { useAuth } from "../../hooks/useAuth";
import { formatPendingCount, useSelfServicePendingCount } from "../../hooks/useSelfServicePendingCount";
import logo from "../../assets/novabank_logo_sidebar.png";
import "./SideBar.css";

const SideBar = ({ openSubmenu, toggleSubmenu, onViewProfile, onLogout }) => {
  const { user } = useAuth();
  const menuItems = getNavigationForRole(user?.role);
  const { pendingCount } = useSelfServicePendingCount(user);

  return (
    <div className="sidebar">
      <img src={logo} alt="Nova Bank Logo" className="h-[90px] w-[190px] object-contain" />
      <div className="navlinks">
        {menuItems.map((item) => {
          if (item.submenu) {
            const isOpen = openSubmenu === item.submenuKey;
            return (
              <div key={item.submenuKey}>
                <div onClick={() => toggleSubmenu(item.submenuKey)} className="sidebar-link" style={{ cursor: "pointer" }}>
                  {item.label} {isOpen ? <FaAngleUp /> : <FaAngleDown />}
                </div>
                <div className={`submenu ${isOpen ? "submenu-open" : ""}`}>
                  {item.submenu.map((sub) => (
                    <NavLink key={sub.path} to={sub.path} className="submenu-link">
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          const Icon = item.icon;
          const showPendingCount = item.path === "/self-service-registrations" && pendingCount > 0;
          return (
            <NavLink key={item.path} to={item.path} end className={({ isActive }) => (isActive ? "sidebar-link sidebar-link-active" : "sidebar-link")}>
              {Icon && <Icon />}
              <span className="sidebar-link-label">{item.label}</span>
              {showPendingCount && (
                <span
                  className="sidebar-pending-badge"
                  aria-label={`${pendingCount} pending self-service registration${pendingCount === 1 ? "" : "s"}`}
                >
                  {formatPendingCount(pendingCount)}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-account-summary">
          <span className="sidebar-account-avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || "N"}</span>
          <span className="sidebar-account-copy">
            <strong>{user?.name || "NOVA User"}</strong>
            <small>{ROLE_LABELS[user?.role] || user?.role || "Portal user"}</small>
          </span>
        </div>
        <button type="button" className="sidebar-footer-button" onClick={onViewProfile}>
          <FiUser aria-hidden="true" />
          <span>View profile</span>
        </button>
        <button type="button" className="sidebar-footer-button sidebar-footer-logout" onClick={onLogout}>
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;
