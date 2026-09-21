import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const authService = {
  login: async (credentials) => unwrapResponse(await apiClient.post("/auth/login", credentials)),
  refresh: async () => unwrapResponse(await apiClient.post("/auth/refresh")),
  profile: async (config = {}) => unwrapResponse(await apiClient.get("/auth/profile", config)),
  logout: async () => apiClient.post("/auth/logout"),
};
