import {
  FiActivity,
  FiAlertTriangle,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiHome,
  FiLogOut,
  FiSearch,
  FiSettings,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
  Frontdesk: "Frontdesk",
  EMPLOYEE_HOST: "EMPLOYEE_HOST",
  SECURITY_OFFICER: "SECURITY_OFFICER",
  AUDITOR: "AUDITOR",
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: "Super Administrator",
  [USER_ROLES.BRANCH_ADMIN]: "Branch Administrator",
  [USER_ROLES.Frontdesk]: "Frontdesk",
  [USER_ROLES.EMPLOYEE_HOST]: "Employee (Host)",
  [USER_ROLES.SECURITY_OFFICER]: "Security Officer",
  [USER_ROLES.AUDITOR]: "Auditor",
};

export const MENU_ITEMS = {
  dashboard: { label: "Dashboard", path: "/dashboard", icon: FiGrid },
  users: { label: "Manage Users", path: "/users", icon: FiUsers },
  branches: { label: "Manage Branches", path: "/branches", icon: FiHome },
  analytics: { label: "View Analytics", path: "/analytics", icon: FiTrendingUp },
  branch: { label: "Manage Branch", path: "/branch-management", icon: FiHome },
  Frontdesks: { label: "Manage Frontdesks", path: "/Frontdesks", icon: FiUserCheck },
  branchReports: { label: "View Branch Reports", path: "/branch-reports", icon: FiFileText },
  departments: { label: "Manage Departments", path: "/departments", icon: FiBriefcase },
  registerVisitor: { label: "Register Visitor", path: "/visitors/register", icon: FiUserPlus },
  captureDetails: { label: "View all Visitors", path: "/visitors/capture-details", icon: FiUsers },
  issuePass: { label: "Issue Visitor Pass", path: "/visitor-pass/issue", icon: FiCreditCard },
  checkOut: { label: "Check Visitor Out", path: "/visitors/check-out", icon: FiLogOut },
  searchVisitors: { label: "Search Visitors", path: "/visitor-search", icon: FiSearch },
  approveVisitor: { label: "Approve Visitor", path: "/visitor-approvals/approve", icon: FiCheckCircle },
  rejectVisitor: { label: "Reject Visitor", path: "/visitor-approvals/reject", icon: FiXCircle },
  expectedVisitors: { label: "View Expected Visitors", path: "/expected-visitors", icon: FiClock },
  appointments: { label: "Schedule Appointments", path: "/appointments", icon: FiCalendar },
  notifications: { label: "Receive Notifications", path: "/notifications", icon: FiBell },
  verifyVisitor: { label: "Verify Visitor", path: "/security/verify-visitor", icon: FiShield },
  scanPass: { label: "Scan Visitor Pass", path: "/security/scan-pass", icon: FiCreditCard },
  activeVisitors: { label: "Monitor Active Visitors", path: "/active-visitors", icon: FiActivity },
  blacklist: { label: "Blacklist Visitor", path: "/blacklist", icon: FiAlertTriangle },
  auditReports: { label: "Generate Reports", path: "/audit-reports", icon: FiFileText },
  logs: { label: "Logs", path: "/audit-logs", icon: FiActivity },
  visitorHistory: { label: "Visitor History", path: "/visitor-history", icon: FiClock },
};

export const roleMenuItems = {
  [USER_ROLES.SUPER_ADMIN]: [
    MENU_ITEMS.dashboard,
    MENU_ITEMS.users,
    MENU_ITEMS.branches,
    MENU_ITEMS.analytics,
  ],
  [USER_ROLES.BRANCH_ADMIN]: [
    MENU_ITEMS.dashboard,
    MENU_ITEMS.branch,
    MENU_ITEMS.Frontdesks,
    MENU_ITEMS.branchReports,
    MENU_ITEMS.departments,
  ],
  [USER_ROLES.Frontdesk]: [
    MENU_ITEMS.dashboard,
    MENU_ITEMS.registerVisitor,
    MENU_ITEMS.captureDetails,
    MENU_ITEMS.issuePass,
    MENU_ITEMS.checkOut,
    MENU_ITEMS.searchVisitors,
  ],
  [USER_ROLES.EMPLOYEE_HOST]: [
    MENU_ITEMS.dashboard,
    MENU_ITEMS.approveVisitor,
    MENU_ITEMS.rejectVisitor,
    MENU_ITEMS.expectedVisitors,
    MENU_ITEMS.appointments,
    MENU_ITEMS.notifications,
  ],
  [USER_ROLES.SECURITY_OFFICER]: [
    MENU_ITEMS.dashboard,
    MENU_ITEMS.verifyVisitor,
    MENU_ITEMS.scanPass,
    MENU_ITEMS.activeVisitors,
    MENU_ITEMS.blacklist,
  ],
  [USER_ROLES.AUDITOR]: [
    MENU_ITEMS.dashboard,
    MENU_ITEMS.auditReports,
    MENU_ITEMS.logs,
    MENU_ITEMS.visitorHistory,
  ],
};

export const navigationItems = Array.from(
  new Map(Object.values(roleMenuItems).flat().filter(Boolean).map((item) => [item.path, item])).values(),
);

export const getNavigationForRole = (role) =>
  (roleMenuItems[role] || roleMenuItems[USER_ROLES.SUPER_ADMIN]).filter(Boolean);
