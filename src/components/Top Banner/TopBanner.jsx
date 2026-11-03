import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { FiBell } from "react-icons/fi";
import { ROLE_LABELS, USER_ROLES } from "../../config/roles";
import { useAuth } from "../../hooks/useAuth";
import { formatPendingCount, useSelfServicePendingCount } from "../../hooks/useSelfServicePendingCount";
import "./TopBanner.css";

const TopBanner = ({ toggleSidebar, onLogout }) => {
  const iconSize = 25;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFrontDesk, pendingCount } = useSelfServicePendingCount(user);
  const userName = (user?.name || "NOVA USER").toUpperCase();
  const branchName = (user?.branch?.name || (user?.role === USER_ROLES.SUPER_ADMIN ? "ALL BRANCHES" : "NO BRANCH ASSIGNED")).toUpperCase();
  const roleName = (ROLE_LABELS[user?.role] || user?.role || "USER").toUpperCase();

  return (
    <div className="welcome">
      <button className="menu-btn" onClick={toggleSidebar} aria-label="Open menu">
        ☰
      </button>

      <FaUserCircle fill="#241B5E" size={iconSize} />
      <span className="text">
        {userName} <span aria-hidden="true">|</span> {branchName} <span aria-hidden="true">|</span> {roleName}
      </span>

      {isFrontDesk && (
        <button
          type="button"
          className="notification-btn"
          onClick={() => navigate("/self-service-registrations?status=PENDING_APPROVAL")}
          aria-label={`${pendingCount} pending self-service registration${pendingCount === 1 ? "" : "s"}`}
          title="Pending self-service registrations"
        >
          <FiBell size={22} aria-hidden="true" />
          {pendingCount > 0 && <span className="notification-badge" aria-hidden="true">{formatPendingCount(pendingCount)}</span>}
        </button>
      )}

      <button type="button" className="logout-btn cursor-pointer" onClick={onLogout} title="Logout" aria-label="Log out">
        <HiOutlineLogout size={iconSize} color="#e63945" />
      </button>
    </div>
  );
};

export default TopBanner;
