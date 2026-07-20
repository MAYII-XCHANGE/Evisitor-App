import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

const pageParams = ({ page = 0, size = 20, ...filters } = {}) => Object.fromEntries(
  Object.entries({ page, size, ...filters }).filter(([, value]) => value !== "" && value !== null && value !== undefined),
);

export const adminService = {
  roles: async () => unwrapResponse(await apiClient.get("/admin/roles")),
  users: async (params) => unwrapResponse(await apiClient.get("/admin/users", { params: pageParams(params) })),
  user: async (id) => unwrapResponse(await apiClient.get(`/admin/users/${id}`)),
  createUser: async (payload) => unwrapResponse(await apiClient.post("/admin/users", payload)),
  updateUser: async ({ id, payload }) => unwrapResponse(await apiClient.put(`/admin/users/${id}`, payload)),
  updateUserStatus: async ({ id, status }) => unwrapResponse(await apiClient.patch(`/admin/users/${id}/status`, { status })),
  deleteUser: async (id) => apiClient.delete(`/admin/users/${id}`),

  adminDepartments: async (params) => unwrapResponse(await apiClient.get("/admin/departments", { params: pageParams(params) })),
  department: async (id) => unwrapResponse(await apiClient.get(`/admin/departments/${id}`)),
  createDepartment: async (payload) => unwrapResponse(await apiClient.post("/admin/departments", payload)),
  updateDepartment: async ({ id, payload }) => unwrapResponse(await apiClient.put(`/admin/departments/${id}`, payload)),
  updateDepartmentStatus: async ({ id, status }) => unwrapResponse(await apiClient.patch(`/admin/departments/${id}/status`, { status })),
  deleteDepartment: async (id) => apiClient.delete(`/admin/departments/${id}`),

  adminBranches: async (params) => unwrapResponse(await apiClient.get("/admin/branches", { params: pageParams(params) })),
  branch: async (id) => unwrapResponse(await apiClient.get(`/admin/branches/${id}`)),
  createBranch: async (payload) => unwrapResponse(await apiClient.post("/admin/branches", payload)),
  updateBranch: async ({ id, payload }) => unwrapResponse(await apiClient.put(`/admin/branches/${id}`, payload)),
  updateBranchStatus: async ({ id, status }) => unwrapResponse(await apiClient.patch(`/admin/branches/${id}/status`, { status })),
  deleteBranch: async (id) => apiClient.delete(`/admin/branches/${id}`),

  branches: async (pagination) => unwrapResponse(await apiClient.get("/branches", { params: pageParams(pagination) })),
  departments: async (pagination) => unwrapResponse(await apiClient.get("/departments", { params: pageParams(pagination) })),
  blacklist: async (pagination) => unwrapResponse(await apiClient.get("/blacklist", { params: pageParams(pagination) })),
  addToBlacklist: async (payload) => unwrapResponse(await apiClient.post("/blacklist", payload)),
  deactivateBlacklist: async (id) => unwrapResponse(await apiClient.post(`/blacklist/${id}/deactivate`)),
};
