export const NIGERIAN_PHONE_PATTERN = /^(?:\+234|0)[789]\d{9}$/;
export const NIGERIAN_PHONE_ERROR = "Use +2349059773535 or 09059773535";

export const sanitizeNigerianPhoneInput = (value = "") => {
  const hasCountryCode = value.startsWith("+");
  const digits = value.replace(/\D/g, "");
  return `${hasCountryCode ? "+" : ""}${digits}`.slice(0, hasCountryCode ? 14 : 11);
};

export const visitorRegistrationRules = {
  firstName: { required: "First name is required" },
  lastName: { required: "Last name is required" },
  visitorName: { required: "Full name is required", minLength: { value: 2, message: "Enter the visitor's full name" } },
  phoneNumber: {
    required: "Phone number is required",
    pattern: { value: NIGERIAN_PHONE_PATTERN, message: NIGERIAN_PHONE_ERROR },
  },
  email: { pattern: { value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } },
  idType: { required: "ID type is required" },
  idNumber: { required: "ID number is required" },
  hostId: { required: "Host is required" },
  hostName: { required: "Host name is required" },
  departmentName: { required: "Host department is required" },
  branchName: { required: "Host branch is required" },
  departmentId: { required: "Department is required" },
  branchId: { required: "Branch is required" },
  visitDate: { required: "Visit date is required" },
  arrivalTime: { required: "Arrival time is required" },
  visitType: { required: "Visit type is required" },
  purpose: { required: "Purpose is required", maxLength: { value: 2000, message: "Purpose is too long" } },
  visitorType: { required: "Visitor type is required" },
  appointmentDate: { required: "Appointment date is required" },
  appointmentTime: { required: "Appointment time is required" },
  physicalTagId: { required: "Select an available physical visitor tag" },
  photograph: {},
  signature: {},
  termsAccepted: { required: "Terms and Conditions must be accepted" },
};

export const VISITOR_TYPE_OPTIONS = [
  { label: "Guest", value: "GUEST" }, { label: "Contractor", value: "CONTRACTOR" },
  { label: "Vendor", value: "VENDOR" }, { label: "Interview Candidate", value: "INTERVIEW_CANDIDATE" },
  { label: "Delivery Personnel", value: "DELIVERY_PERSONNEL" }, { label: "Government Official", value: "GOVERNMENT_OFFICIAL" },
  { label: "Other", value: "OTHER" },
];

export const ID_TYPE_OPTIONS = [
  { label: "National ID", value: "NATIONAL_ID" },
  { label: "Driver's License", value: "DRIVERS_LICENSE" },
  { label: "International Passport", value: "INTERNATIONAL_PASSPORT" },
  { label: "Voter's Card", value: "VOTERS_CARD" },
  { label: "Staff ID", value: "STAFF_ID" },
  { label: "Other", value: "OTHER" },
];

export const VISIT_TYPE_OPTIONS = [
  { label: "Walk-in", value: "WALK_IN" },
  { label: "Appointment", value: "APPOINTMENT" },
  { label: "Vendor", value: "VENDOR" },
  { label: "Regulatory Visit", value: "REGULATORY_VISIT" },
];

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const validatePhotograph = (file) => {
  if (!file) return null;
  if (!PHOTO_TYPES.includes(file.type)) return "Use a JPEG, PNG, or WebP image";
  if (file.size > 5 * 1024 * 1024) return "Photograph must not exceed 5 MB";
  return null;
};
