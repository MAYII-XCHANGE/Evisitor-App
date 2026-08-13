import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import LoginPage from "../pages/LoginPage/LoginPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ALL_ROLES, USER_ROLES } from "../config/roles";
import { VisitorRegistrationPage } from "../features/visitors/VisitorRegistrationPage";
import { VisitorsPage } from "../features/visitors/VisitorsPage";
import { VisitorPhotographPage } from "../features/visitors/VisitorPhotographPage";
import { VisitorHistoryPage } from "../features/visitors/VisitorHistoryPage";
import { AppointmentsPage } from "../features/appointments/AppointmentsPage";
import { ExpectedVisitorsPage } from "../features/appointments/ExpectedVisitorsPage";
import { ActiveVisitsPage } from "../features/visits/ActiveVisitsPage";
import { PassOperationsPage } from "../features/passes/PassOperationsPage";
import { UsersPage } from "../features/admin/UsersPage";
import { BranchesPage } from "../features/admin/BranchesPage";
import { DepartmentsPage } from "../features/admin/DepartmentsPage";
import { BlacklistPage } from "../features/blacklist/BlacklistPage";
import { NotificationsPage } from "../features/notifications/NotificationsPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { ReportsPage } from "../features/reports/ReportsPage";
import { BranchReportsPage } from "../features/reports/BranchReportsPage";
import { AuditLogsPage } from "../features/reports/AuditLogsPage";
import { AnalyticsPage } from "../features/reports/AnalyticsPage";
import { SelfServicePage } from "../features/selfservice/SelfServicePage";
import { SelfServiceRegistrationsPage } from "../features/selfservice/SelfServiceRegistrationsPage";
import { PhysicalTagsPage } from "../features/physicaltags/PhysicalTagsPage";

const roles = (...values) => values;
const visitorReaders = roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.FRONTDESK, USER_ROLES.SECURITY_OFFICER, USER_ROLES.AUDITOR);
const reception = roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.FRONTDESK);
const frontDeskOnly = roles(USER_ROLES.FRONTDESK);
const appointmentUsers = roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.FRONTDESK, USER_ROLES.EMPLOYEE_HOST);
const reportUsers = roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.AUDITOR);

const secured = (allowedRoles, element) => <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>;

export const router = createBrowserRouter([
  { path: "/", element: <SelfServicePage /> },
  { path: "/self-service", element: <Navigate to="/" replace /> },
  { path: "/staff/login", element: <LoginPage /> },
  { path: "/login", element: <Navigate to="/staff/login" replace /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <DashboardLayout />,
      children: [
        { path: "dashboard", element: secured(ALL_ROLES, <DashboardPage />) },
        { path: "visitors/register", element: secured(frontDeskOnly, <VisitorRegistrationPage />) },
        { path: "visitors", element: secured(visitorReaders, <VisitorsPage />) },
        { path: "visitor-search", element: secured(visitorReaders, <VisitorsPage />) },
        { path: "visitors/photograph", element: secured(reception, <VisitorPhotographPage />) },
        { path: "visitor-history", element: secured(visitorReaders, <VisitorHistoryPage />) },
        { path: "appointments", element: secured(appointmentUsers, <AppointmentsPage />) },
        { path: "visitor-approvals", element: secured(roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.EMPLOYEE_HOST), <AppointmentsPage approvalsOnly />) },
        { path: "expected-visitors", element: secured(roles(USER_ROLES.EMPLOYEE_HOST), <ExpectedVisitorsPage />) },
        { path: "visitors/check-out", element: secured(frontDeskOnly, <ActiveVisitsPage checkoutMode />) },
        { path: "self-service-registrations", element: secured(frontDeskOnly, <SelfServiceRegistrationsPage />) },
        { path: "physical-tags", element: secured(roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.FRONTDESK), <PhysicalTagsPage />) },
        { path: "active-visitors", element: secured(roles(...reception, USER_ROLES.SECURITY_OFFICER, USER_ROLES.EMPLOYEE_HOST, USER_ROLES.AUDITOR), <ActiveVisitsPage />) },
        { path: "security/after-hours", element: secured(roles(USER_ROLES.SECURITY_OFFICER), <ActiveVisitsPage afterHoursOnly checkoutMode />) },
        { path: "visitor-pass/issue", element: secured(reception, <PassOperationsPage mode="issue" />) },
        { path: "security/verify-visitor", element: secured(roles(USER_ROLES.SECURITY_OFFICER), <PassOperationsPage mode="lookup" />) },
        { path: "security/scan-pass", element: secured(roles(USER_ROLES.SECURITY_OFFICER), <PassOperationsPage mode="scan" />) },
        { path: "users", element: secured(roles(USER_ROLES.SUPER_ADMIN), <UsersPage />) },
        { path: "branches", element: secured(roles(USER_ROLES.SUPER_ADMIN), <BranchesPage />) },
        { path: "departments", element: secured(roles(USER_ROLES.SUPER_ADMIN), <DepartmentsPage />) },
        { path: "blacklist", element: secured(roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.BRANCH_ADMIN, USER_ROLES.SECURITY_OFFICER), <BlacklistPage />) },
        { path: "notifications", element: secured(roles(USER_ROLES.EMPLOYEE_HOST, USER_ROLES.BRANCH_ADMIN), <NotificationsPage />) },
        { path: "reports", element: secured(reportUsers, <ReportsPage />) },
        { path: "branch-reports", element: secured(roles(USER_ROLES.BRANCH_ADMIN), <BranchReportsPage />) },
        { path: "audit-logs", element: secured(roles(USER_ROLES.AUDITOR, USER_ROLES.SUPER_ADMIN), <AuditLogsPage />) },
        { path: "analytics", element: secured(roles(USER_ROLES.SUPER_ADMIN), <AnalyticsPage />) },
        { path: "settings", element: secured(roles(USER_ROLES.SUPER_ADMIN), <SettingsPage />) },
      ],
    }],
  },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
