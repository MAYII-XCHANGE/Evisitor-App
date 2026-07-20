import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const dashboardService = {
  get: async (date) => unwrapResponse(await apiClient.get("/dashboard", { params: date ? { date } : undefined })),
};
