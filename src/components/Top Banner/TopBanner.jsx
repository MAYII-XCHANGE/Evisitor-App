import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { HiOutlineLogout } from "react-icons/hi";
import { FiAlertTriangle, FiKey } from "react-icons/fi";
import toast from "react-hot-toast";
import { ROLE_LABELS } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../ConfirmModal";
import { ChangePasswordModal } from "../../features/auth/ChangePasswordModal";
import "./TopBanner.css";

const TopBanner = ({ toggleSidebar }) => {
  const iconSize = 25;
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogOut = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="welcome">
      <button className="menu-btn" onClick={toggleSidebar} aria-label="Open menu">
        ☰
      </button>

      <FaUserCircle fill="#241B5E" size={iconSize} />
      <span className="text">
        Welcome, {user?.name || "NOVA User"} ({ROLE_LABELS[user?.role] || user?.role})
      </span>

      <button className="logout-btn cursor-pointer" onClick={() => setShowPasswordModal(true)} title="Change password">
        <FiKey size={22} color="#241B5E" />
      </button>

      <button className="logout-btn cursor-pointer" onClick={() => setShowLogoutModal(true)} title="Logout">
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
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
};

export default TopBanner;
