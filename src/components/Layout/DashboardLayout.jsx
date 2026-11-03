import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import SideBar from "../SideBar/SideBar";
import MobileSideBar from "../SideBar/MobileSideBar";
import { UserProfileModal } from "../SideBar/UserProfileModal";
import TopBanner from "../Top Banner/TopBanner";
import ConfirmModal from "../ConfirmModal";
import { useAuth } from "../../hooks/useAuth";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("visitors");
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  const toggleSubmenu = (option) => {
    setOpenSubmenu((current) => (current === option ? "" : option));
  };

  const toggleSidebar = () => {
    setShowDropdown((current) => !current);
  };

  const closeMobileSidebar = () => {
    setShowDropdown(false);
    setOpenSubmenu("");
  };

  const openProfile = () => {
    closeMobileSidebar();
    setShowProfile(true);
  };

  const openLogout = () => {
    closeMobileSidebar();
    setShowLogoutModal(true);
  };

  const handleLogOut = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      {showDropdown && <button type="button" aria-label="Close menu" className="mobile-sidebar-overlay" onClick={closeMobileSidebar} />}

      <MobileSideBar
        showDropdown={showDropdown}
        dropdownRef={dropdownRef}
        toggleSubmenu={toggleSubmenu}
        closeSidebar={closeMobileSidebar}
        openSubmenu={openSubmenu}
        onViewProfile={openProfile}
        onLogout={openLogout}
      />

      <div className="wrapper">
        <SideBar toggleSubmenu={toggleSubmenu} openSubmenu={openSubmenu} onViewProfile={openProfile} onLogout={openLogout} />
        <div className="outlets">
          <TopBanner toggleSidebar={toggleSidebar} onLogout={openLogout} />
          <Outlet />
        </div>
      </div>

      <UserProfileModal isOpen={showProfile} user={user} onClose={() => setShowProfile(false)} />
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

export default DashboardLayout;
