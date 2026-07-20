import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const notificationService = {
  list: async ({ page = 0, size = 10 } = {}) =>
    unwrapResponse(await apiClient.get("/notifications", { params: { page, size } })),
  send: async (payload) => unwrapResponse(await apiClient.post("/notifications", payload)),
  markRead: async (id) => unwrapResponse(await apiClient.post(`/notifications/${id}/read`)),
};
