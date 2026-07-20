import { NavLink } from "react-router-dom";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { getNavigationForRole } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/novabank_logo_sidebar.png";
import "./SideBar.css";

const SideBar = ({ openSubmenu, toggleSubmenu }) => {
  const { user } = useAuth();
  const menuItems = getNavigationForRole(user?.role);

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
          return (
            <NavLink key={item.path} to={item.path} end className={({ isActive }) => (isActive ? "sidebar-link sidebar-link-active" : "sidebar-link")}>
              {Icon && <Icon />} {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;
