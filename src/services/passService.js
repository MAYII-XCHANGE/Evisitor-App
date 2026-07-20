import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const passService = {
  issue: async (payload) => unwrapResponse(await apiClient.post("/passes", payload)),
  get: async (code) => unwrapResponse(await apiClient.get(`/passes/${encodeURIComponent(code)}`)),
  printData: async (code) => unwrapResponse(await apiClient.get(`/passes/${encodeURIComponent(code)}/print-data`)),
  scan: async (token) => unwrapResponse(await apiClient.post("/passes/scan", { token })),
  returnPass: async (id) => unwrapResponse(await apiClient.post(`/passes/${id}/return`)),
  revoke: async (id) => unwrapResponse(await apiClient.post(`/passes/${id}/revoke`)),
};
