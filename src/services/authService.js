import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const authService = {
  csrf: async () => apiClient.get("/auth/csrf"),
  login: async (credentials) => unwrapResponse(await apiClient.post("/auth/login", credentials)),
  refresh: async () => unwrapResponse(await apiClient.post("/auth/refresh")),
  me: async (config = {}) => unwrapResponse(await apiClient.get("/auth/me", config)),
  logout: async () => apiClient.post("/auth/logout"),
};
