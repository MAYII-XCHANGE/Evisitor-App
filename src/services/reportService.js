import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const reportService = {
  audit: async ({ page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get("/reports/audit", { params: { page, size } })),
  visitorVolume: async ({ startDate, endDate } = {}) =>
    unwrapResponse(await apiClient.get("/reports/visitor-volume", { params: { startDate, endDate } })),
  branchPerformance: async (date) =>
    unwrapResponse(await apiClient.get("/reports/branch-performance", { params: date ? { date } : undefined })),
  branchSummary: async ({ startDate, endDate }) =>
    unwrapResponse(await apiClient.get("/reports/branch-summary", { params: { startDate, endDate } })),
  branchVisitors: async ({ page = 0, size = 10, ...params }) =>
    unwrapResponse(await apiClient.get("/reports/branch-visitors", { params: { page, size, ...params } })),
  exportBranchReport: async ({ format = "csv", params = {} }) =>
    (await apiClient.get("/reports/branch-export", {
      params: { ...params, format },
      responseType: "blob",
    })).data,
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
