const statusStyles = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Pending: "bg-amber-50 text-amber-700 ring-amber-100",
  "Checked In": "bg-primary-50 text-primary-700 ring-primary-100",
  "Checked Out": "bg-slate-100 text-slate-700 ring-slate-200",
  Blacklisted: "bg-red-50 text-red-700 ring-red-100",
  Escalated: "bg-orange-50 text-orange-700 ring-orange-100",
  Onsite: "bg-primary-50 text-primary-700 ring-primary-100",
  Escorted: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "Pending Host": "bg-amber-50 text-amber-700 ring-amber-100",
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[status] || "bg-gray-100 text-gray-700 ring-gray-200"}`}>
    {status}
  </span>
);
