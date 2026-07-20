import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const settingService = {
  list: async ({ page = 0, size = 10 } = {}) => unwrapResponse(await apiClient.get("/settings", { params: { page, size } })),
  save: async (payload) => unwrapResponse(await apiClient.put("/settings", payload)),
};
