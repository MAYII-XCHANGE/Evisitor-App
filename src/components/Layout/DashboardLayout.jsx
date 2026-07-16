import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import MobileSideBar from "../SideBar/MobileSideBar";
import TopBanner from "../Top Banner/TopBanner";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("visitors");
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
      />

      <div className="wrapper">
        <SideBar toggleSubmenu={toggleSubmenu} openSubmenu={openSubmenu} />
        <div className="outlets">
          <TopBanner toggleSidebar={toggleSidebar} />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
