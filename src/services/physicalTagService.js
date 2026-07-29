import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const physicalTagService = {
  list: async ({ page = 0, size = 10, ...params } = {}) =>
    unwrapResponse(await apiClient.get("/physical-tags", { params: { page, size, ...params } })),
  available: async () => unwrapResponse(await apiClient.get("/physical-tags/available")),
  metrics: async () => unwrapResponse(await apiClient.get("/physical-tags/metrics")),
  create: async (payload) => unwrapResponse(await apiClient.post("/physical-tags", payload)),
  update: async ({ id, payload }) => unwrapResponse(await apiClient.put(`/physical-tags/${id}`, payload)),
  changeStatus: async ({ id, status, comment = null }) =>
    unwrapResponse(await apiClient.patch(`/physical-tags/${id}/status`, { status, comment })),
  resolve: async ({ id, returnStatus, comment = null }) =>
    unwrapResponse(await apiClient.post(`/physical-tags/${id}/resolve`, { returnStatus, comment })),
  history: async (id, { page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get(`/physical-tags/${id}/history`, { params: { page, size } })),
  currentVisitor: async (id) => unwrapResponse(await apiClient.get(`/physical-tags/${id}/current-visitor`)),
};
