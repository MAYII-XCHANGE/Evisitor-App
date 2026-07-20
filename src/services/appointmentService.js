import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const appointmentService = {
  list: async ({ page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get("/appointments", { params: { page, size } })),
  expected: async ({ page = 0, size = 10 } = {}) => unwrapResponse(await apiClient.get("/appointments/expected", { params: { page, size } })),
  get: async (id) => unwrapResponse(await apiClient.get(`/appointments/${id}`)),
  create: async (payload) => unwrapResponse(await apiClient.post("/appointments", payload)),
  update: async (id, payload) => unwrapResponse(await apiClient.patch(`/appointments/${id}`, payload)),
  approve: async (id, reason = "") => unwrapResponse(await apiClient.post(`/appointments/${id}/approve`, { reason })),
  reject: async (id, reason) => unwrapResponse(await apiClient.post(`/appointments/${id}/reject`, { reason })),
  reschedule: async (id, payload) => unwrapResponse(await apiClient.post(`/appointments/${id}/reschedule`, payload)),
  cancel: async (id) => unwrapResponse(await apiClient.post(`/appointments/${id}/cancel`)),
  frontDesk: async ({ page = 0, size = 10, ...params } = {}) => unwrapResponse(await apiClient.get("/appointments/frontdesk", { params: { page, size, ...params } })),
  today: async ({ page = 0, size = 10 } = {}) => unwrapResponse(await apiClient.get("/appointments/today", { params: { page, size } })),
  markNoShow: async ({ id, reason }) => unwrapResponse(await apiClient.post(`/appointments/${id}/no-show`, { reason: reason || null })),
  frontDeskReschedule: async ({ id, payload }) => unwrapResponse(await apiClient.put(`/appointments/${id}/frontdesk-reschedule`, payload)),
};
