import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { FiAlertTriangle, FiBell } from "react-icons/fi";
import toast from "react-hot-toast";
import { ROLE_LABELS, USER_ROLES } from "../../config/roles";
import { useAuth } from "../../hooks/useAuth";
import { selfServiceService } from "../../services/selfServiceService";
import ConfirmModal from "../ConfirmModal";
import "./TopBanner.css";

const TopBanner = ({ toggleSidebar }) => {
  const iconSize = 25;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const isFrontDesk = user?.role === USER_ROLES.FRONTDESK;
  const pending = useQuery({
    queryKey: ["self-service-pending-count", user?.branch?.id],
    queryFn: selfServiceService.pendingCount,
    enabled: isFrontDesk && Boolean(user?.branch?.id),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    staleTime: 15_000,
    retry: 1,
  });
  const pendingCount = pending.data?.count || 0;
  const userName = (user?.name || "NOVA USER").toUpperCase();
  const branchName = (user?.branch?.name || (user?.role === USER_ROLES.SUPER_ADMIN ? "ALL BRANCHES" : "NO BRANCH ASSIGNED")).toUpperCase();
  const roleName = (ROLE_LABELS[user?.role] || user?.role || "USER").toUpperCase();

  const handleLogOut = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

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
          {pendingCount > 0 && <span className="notification-badge" aria-hidden="true">{pendingCount > 99 ? "99+" : pendingCount}</span>}
        </button>
      )}

      <button type="button" className="logout-btn cursor-pointer" onClick={() => setShowLogoutModal(true)} title="Logout" aria-label="Log out">
        <HiOutlineLogout size={iconSize} color="#e63945" />
      </button>

      <ConfirmModal
        isOpen={showLogoutModal}
        title={<FiAlertTriangle size={50} aria-label="Warning" />}
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleLogOut}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default TopBanner;
