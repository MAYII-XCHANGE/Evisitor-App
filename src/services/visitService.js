import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const visitService = {
  active: async ({ page = 0, size = 20 } = {}) =>
    unwrapResponse(await apiClient.get("/visits/active", { params: { page, size } })),
  checkIn: async (payload) => unwrapResponse(await apiClient.post("/visits/check-in", payload)),
  checkOut: async (id, notes = "") => unwrapResponse(await apiClient.post(`/visits/${id}/check-out`, { notes })),
};
