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
      departmentName: values.departmentName.trim(),
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
  list: async ({ page = 0, size = 20, status = "AWAITING_FRONTDESK", search = "" } = {}) =>
    unwrapResponse(await apiClient.get("/self-service/registrations", { params: { page, size, status, ...(search ? { search } : {}) } })),
  approve: async (id) => unwrapResponse(await apiClient.post(`/self-service/registrations/${id}/approve`)),
  reject: async (id, reason) => unwrapResponse(await apiClient.post(`/self-service/registrations/${id}/reject`, { reason })),
};
