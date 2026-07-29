import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const visitService = {
  active: async ({ page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get("/visits/active", { params: { page, size } })),
  checkOut: async (id, payload) => unwrapResponse(await apiClient.post(`/visits/${id}/check-out`, payload)),
};
