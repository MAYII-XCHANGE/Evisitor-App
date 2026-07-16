export const Select = ({ label, options = [], className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">{label}</span>}
    <select
      className={`h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
