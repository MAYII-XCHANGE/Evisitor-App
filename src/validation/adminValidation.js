const email = { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" } };
export const userRules = {
  email: { required: "Email is required", ...email },
  role: { required: "Role is required" },
};

export const branchRules = {
  name: { required: "Branch name is required" },
  address: { required: "Address is required" },
  visitorCapacity: { required: "Visitor capacity is required", min: { value: 1, message: "Capacity must be positive" } },
};

export const departmentRules = {
  name: { required: "Department name is required" }, branchId: { required: "Branch is required" },
};

export const blacklistRules = { visitorId: { required: "Visitor is required" }, reason: { required: "Reason is required" }, severity: { required: "Severity is required" } };
