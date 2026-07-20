import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const settingService = {
  list: async () => unwrapResponse(await apiClient.get("/settings")),
  save: async (payload) => unwrapResponse(await apiClient.put("/settings", payload)),
};
