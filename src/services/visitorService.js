import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const visitorService = {
  list: async ({ page = 0, size = 10, q = "" } = {}) =>
    unwrapResponse(await apiClient.get("/visitors", { params: { page, size, ...(q ? { q } : {}) } })),
  search: async ({ q, page = 0, size = 10 }) =>
    unwrapResponse(await apiClient.get("/visitors/search", { params: { q, page, size } })),
  get: async (id) => unwrapResponse(await apiClient.get(`/visitors/${id}`)),
  register: async (payload) => unwrapResponse(await apiClient.post("/visitors", payload)),
  registerWorkflow: async (payload) => unwrapResponse(await apiClient.post("/visitors/walk-in", payload)),
  uploadFile: async (type, file) => {
    const body = new FormData();
    body.append("file", file);
    return unwrapResponse(await apiClient.post(`/visitors/files/${type}`, body));
  },
  deleteFile: async (id) => apiClient.delete(`/visitors/files/${id}`),
  directory: async ({ page = 0, size = 10, ...params } = {}) => unwrapResponse(await apiClient.get("/visitors/directory", { params: { page, size, ...params } })),
  details: async (id) => unwrapResponse(await apiClient.get(`/visitors/${id}/details`)),
  exportVisitors: async ({ format = "csv", params = {} } = {}) =>
    (await apiClient.get("/visitors/export", { params: { ...params, format }, responseType: "blob" })).data,
  update: async (id, payload) => unwrapResponse(await apiClient.patch(`/visitors/${id}`, payload)),
  history: async (id, { page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get(`/visitors/${id}/history`, { params: { page, size } })),
  uploadPhotograph: async (id, file) => {
    const body = new FormData();
    body.append("file", file);
    return unwrapResponse(await apiClient.post(`/visitors/${id}/photograph`, body));
  },
};
