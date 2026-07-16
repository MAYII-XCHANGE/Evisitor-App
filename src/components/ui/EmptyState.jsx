import { FiInbox } from "react-icons/fi";

export const EmptyState = ({ title = "No records found", message = "Try adjusting your search or filters." }) => (
  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <FiInbox className="h-10 w-10 text-primary" />
    <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-slate-400">{message}</p>
  </div>
);
