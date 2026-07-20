import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const appointmentService = {
  list: async ({ page = 0, size = 20 } = {}) =>
    unwrapResponse(await apiClient.get("/appointments", { params: { page, size } })),
  expected: async () => unwrapResponse(await apiClient.get("/appointments/expected")),
  get: async (id) => unwrapResponse(await apiClient.get(`/appointments/${id}`)),
  create: async (payload) => unwrapResponse(await apiClient.post("/appointments", payload)),
  update: async (id, payload) => unwrapResponse(await apiClient.patch(`/appointments/${id}`, payload)),
  approve: async (id, reason = "") => unwrapResponse(await apiClient.post(`/appointments/${id}/approve`, { reason })),
  reject: async (id, reason) => unwrapResponse(await apiClient.post(`/appointments/${id}/reject`, { reason })),
  reschedule: async (id, payload) => unwrapResponse(await apiClient.post(`/appointments/${id}/reschedule`, payload)),
  cancel: async (id) => unwrapResponse(await apiClient.post(`/appointments/${id}/cancel`)),
  frontDesk: async ({ page = 0, size = 20, ...params } = {}) => unwrapResponse(await apiClient.get("/appointments/frontdesk", { params: { page, size, ...params } })),
  today: async ({ page = 0, size = 20 } = {}) => unwrapResponse(await apiClient.get("/appointments/today", { params: { page, size } })),
  upcoming: async ({ page = 0, size = 20 } = {}) => unwrapResponse(await apiClient.get("/appointments/upcoming", { params: { page, size } })),
  confirmArrival: async (id) => unwrapResponse(await apiClient.post(`/appointments/${id}/confirm-arrival`)),
  markNoShow: async ({ id, reason }) => unwrapResponse(await apiClient.post(`/appointments/${id}/no-show`, { reason: reason || null })),
  frontDeskReschedule: async ({ id, payload }) => unwrapResponse(await apiClient.put(`/appointments/${id}/frontdesk-reschedule`, payload)),
  checkInPreRegistered: async ({ id, payload }) => unwrapResponse(await apiClient.post(`/appointments/${id}/check-in`, payload)),
};
