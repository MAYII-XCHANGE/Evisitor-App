import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import LoginPage from "../pages/LoginPage/LoginPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import VisitorModulePage from "../pages/VisitorModulePage/VisitorModulePage";
import { navigationItems } from "../config/navigation";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { ProtectedRoute } from "./ProtectedRoute";

const moduleRoutes = navigationItems
  .filter((item) => item.path !== "/dashboard")
  .map((item) => ({
    path: item.path.replace(/^\//, ""),
    element: <VisitorModulePage />,
  }));

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          ...moduleRoutes,
        ],
      },
    ],
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
