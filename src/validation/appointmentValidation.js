export const appointmentRules = {
  visitorId: { required: "Visitor is required" },
  hostId: { required: "Host is required" },
  departmentId: { required: "Department is required" },
  branchId: { required: "Branch is required" },
  scheduledDate: { required: "Appointment date is required" },
  arrivalTime: { required: "Arrival time is required" },
  visitType: { required: "Visit type is required" },
  purpose: { required: "Purpose is required", maxLength: { value: 2000, message: "Purpose is too long" } },
};

export const rejectionRules = {
  required: "A rejection reason is required",
  maxLength: { value: 500, message: "Reason must not exceed 500 characters" },
};
