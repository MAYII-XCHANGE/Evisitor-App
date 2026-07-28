import { usePwa } from "../../hooks/usePwa";

const variants = {
  primary: "border-primary bg-primary text-white hover:bg-primary-700",
  secondary: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
  ghost: "border-transparent bg-transparent text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "border-danger bg-danger text-white hover:bg-red-600",
};

export const Button = ({
  children,
  className = "",
  variant = "primary",
  type = "button",
  requiresOnline,
  disabled = false,
  title,
  ...props
}) => {
  const { isOnline } = usePwa();
  const onlineRequired = requiresOnline ?? type === "submit";
  const offlineDisabled = onlineRequired && !isOnline;

  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-subtle transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled || offlineDisabled}
      title={offlineDisabled ? "Internet connection required" : title}
      {...props}
    >
      {children}
    </button>
  );
};
