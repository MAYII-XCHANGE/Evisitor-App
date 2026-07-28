import { apiClient } from "./apiClient";
import { unwrapResponse } from "../utils/apiResponse";

const clean = (value) => value?.trim() || null;

export const selfServiceService = {
  submit: async (values) => {
    const request = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phoneNumber: values.phoneNumber.trim(),
      email: clean(values.email),
      company: clean(values.company),
      visitorType: values.visitorType,
      purpose: values.purpose.trim(),
      hostName: values.hostName.trim(),
      departmentId: values.departmentId || null,
      departmentName: values.departmentName.trim(),
      branchId: values.branchId || null,
      branchName: values.branchName.trim(),
      appointmentDate: values.appointmentDate,
      appointmentTime: values.appointmentTime,
      idType: values.idType,
      idNumber: values.idNumber.trim(),
      vehicleNumber: clean(values.vehicleNumber),
      items: (values.items || []).map((item) => ({
        itemName: item.itemName.trim(),
        description: clean(item.description),
        quantity: Number(item.quantity) || 1,
        serialNumber: clean(item.serialNumber),
      })),
      termsAccepted: values.termsAccepted,
      termsVersion: values.termsVersion,
      website: values.website || "",
    };
    const body = new FormData();
    body.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));
    if (values.idDocument) body.append("idDocument", values.idDocument);
    if (values.photograph) body.append("photograph", values.photograph);
    if (values.signature) body.append("signature", values.signature);
    return unwrapResponse(await apiClient.post("/self-service/registrations", body));
  },
  options: async () => unwrapResponse(await apiClient.get("/self-service/registrations/options")),
  byReference: async (reference) => unwrapResponse(await apiClient.get(`/self-service/registrations/reference/${encodeURIComponent(reference)}`)),
  list: async ({ page = 0, size = 10, status = "PENDING_APPROVAL", search = "" } = {}) =>
    unwrapResponse(await apiClient.get("/self-service/registrations", { params: { page, size, status, ...(search ? { search } : {}) } })),
  approve: async (id) => unwrapResponse(await apiClient.post(`/self-service/registrations/${id}/approve`)),
  reject: async (id, reason) => unwrapResponse(await apiClient.post(`/self-service/registrations/${id}/reject`, { reason })),
};
