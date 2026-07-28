import axios from "axios";
import { getApiError } from "../utils/apiResponse";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 20000,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { Accept: "application/json" },
});

let refreshHandler = null;
let unauthorizedHandler = null;
let csrfHandler = null;
let refreshPromise = null;
let csrfPromise = null;

export const configureApiSession = ({ refresh, csrf, onUnauthorized }) => {
  refreshHandler = refresh;
  csrfHandler = csrf;
  unauthorizedHandler = onUnauthorized;
};

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

apiClient.interceptors.request.use((config) => {
  const isUnsafeRequest = unsafeMethods.has(config.method?.toLowerCase());
  if (isUnsafeRequest && typeof navigator !== "undefined" && !navigator.onLine) {
    const error = new Error("You are offline. Reconnect before submitting this request.");
    error.code = "ERR_NETWORK_OFFLINE";
    error.isOffline = true;
    return Promise.reject(error);
  }
  if (!(config.data instanceof FormData) && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isUnsafeRequest = unsafeMethods.has(request?.method?.toLowerCase());
    if (error.response?.status === 403 && isUnsafeRequest && !request?._csrfRetried && csrfHandler) {
      request._csrfRetried = true;
      try {
        csrfPromise ||= Promise.resolve(csrfHandler()).finally(() => {
          csrfPromise = null;
        });
        await csrfPromise;
        return apiClient(request);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    const isAuthRequest = request?.url?.includes("/auth/login") || request?.url?.includes("/auth/refresh") || request?.url?.includes("/auth/logout");
    if (error.response?.status !== 401 || request?._retried || request?.skipAuthRefresh || isAuthRequest || !refreshHandler) {
      return Promise.reject(error);
    }

    request._retried = true;
    try {
      refreshPromise ||= Promise.resolve(refreshHandler()).finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return apiClient(request);
    } catch (refreshError) {
      unauthorizedHandler?.(getApiError(refreshError));
      return Promise.reject(refreshError);
    }
  },
);
