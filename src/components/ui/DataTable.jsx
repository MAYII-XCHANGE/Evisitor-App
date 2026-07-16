import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { EmptyState } from "./EmptyState";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";

const PAGE_SIZE = 5;

export const DataTable = ({ rows = [], searchTerm = "" }) => {
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(needle)));
  }, [rows, searchTerm]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (!filteredRows.length) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="table-scroll overflow-x-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-gray-500">
              {["Reference", "Visitor", "Branch", "Department", "Host", "Status", "Date"].map((heading) => (
                <th key={heading} className="border-b border-gray-100 bg-surface-muted px-4 py-3 font-bold dark:border-slate-800 dark:bg-slate-950">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {visibleRows.map((row) => (
              <tr key={row.id} className="group">
                <td className="border-b border-gray-100 px-4 py-4 font-semibold text-gray-900 dark:border-slate-800 dark:text-white">{row.id}</td>
                <td className="border-b border-gray-100 px-4 py-4 text-gray-700 dark:border-slate-800 dark:text-slate-200">{row.visitor}</td>
                <td className="border-b border-gray-100 px-4 py-4 text-gray-600 dark:border-slate-800 dark:text-slate-300">{row.branch}</td>
                <td className="border-b border-gray-100 px-4 py-4 text-gray-600 dark:border-slate-800 dark:text-slate-300">{row.department}</td>
                <td className="border-b border-gray-100 px-4 py-4 text-gray-600 dark:border-slate-800 dark:text-slate-300">{row.host}</td>
                <td className="border-b border-gray-100 px-4 py-4 dark:border-slate-800"><StatusBadge status={row.status} /></td>
                <td className="border-b border-gray-100 px-4 py-4 text-gray-500 dark:border-slate-800 dark:text-slate-400">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-gray-500">
          Showing {visibleRows.length} of {filteredRows.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="px-3" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            <FiChevronLeft />
          </Button>
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            {currentPage} / {pageCount}
          </span>
          <Button variant="secondary" className="px-3" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
            <FiChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
