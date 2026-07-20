import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const reportService = {
  audit: async ({ page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get("/reports/audit", { params: { page, size } })),
  visitorVolume: async ({ startDate, endDate } = {}) =>
    unwrapResponse(await apiClient.get("/reports/visitor-volume", { params: { startDate, endDate } })),
  branchPerformance: async (date) =>
    unwrapResponse(await apiClient.get("/reports/branch-performance", { params: date ? { date } : undefined })),
  activeVisitors: async (pagination) =>
    unwrapResponse(await apiClient.get("/reports/active-visitors", { params: pagination })),
  appointments: async (pagination) =>
    unwrapResponse(await apiClient.get("/reports/appointments", { params: pagination })),
  blacklist: async (pagination) =>
    unwrapResponse(await apiClient.get("/reports/blacklist", { params: pagination })),
  exportAudit: async () => {
    const response = await apiClient.get("/reports/export", {
      params: { type: "audit", format: "csv" },
      responseType: "blob",
    });
    return response.data;
  },
};
