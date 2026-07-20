export const loginRules = {
  email: {
    required: "Email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
  },
  password: { required: "Password is required" },
};

export const passwordRules = {
  currentPassword: { required: "Current password is required" },
  newPassword: {
    required: "New password is required",
    minLength: { value: 12, message: "Use at least 12 characters" },
  },
};
