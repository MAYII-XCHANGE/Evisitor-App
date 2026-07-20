export const loginRules = {
  email: {
    required: "Email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address" },
  },
  password: { required: "Password is required" },
};
