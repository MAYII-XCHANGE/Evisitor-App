import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

export const lookupService = {
  hosts: async (q = "") => unwrapResponse(await apiClient.get("/lookups/hosts", { params: q ? { q } : undefined })),
  visitors: async (q = "") => unwrapResponse(await apiClient.get("/lookups/visitors", { params: q ? { q } : undefined })),
  recipients: async () => unwrapResponse(await apiClient.get("/lookups/recipients")),
};
