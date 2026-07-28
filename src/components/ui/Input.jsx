export const Input = ({ label, icon: Icon, error, required = false, className = "", ...props }) => (
  <label className="block">
    {label && (
      <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">
        {label}
        {required && <><span className="ml-1 text-danger" aria-hidden="true">*</span><span className="sr-only"> (required)</span></>}
      </span>
    )}
    <span className="relative block">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />}
      <input
        className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
          Icon ? "pl-10" : ""
        } ${error ? "border-danger bg-red-50" : "border-gray-300"} ${className}`}
        required={required}
        aria-required={required || undefined}
        {...props}
      />
    </span>
    {error && <span className="mt-2 block text-sm text-danger">{error}</span>}
  </label>
);
