import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "./Button";

const visiblePages = (current, total) => {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index);
  const candidates = new Set([0, total - 1, current - 1, current, current + 1]);
  const pages = [...candidates].filter((value) => value >= 0 && value < total).sort((a, b) => a - b);
  return pages.reduce((result, value, index) => {
    if (index && value - pages[index - 1] > 1) result.push(`ellipsis-${value}`);
    result.push(value);
    return result;
  }, []);
};

export const Pagination = ({ page, onPageChange }) => {
  if (!page || page.totalElements === 0) return null;
  const pages = visiblePages(page.number, page.totalPages);
  const start = page.number * page.size + 1;
  const end = Math.min(start + page.numberOfElements - 1, page.totalElements);
  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-4 lg:flex-row dark:border-slate-800">
      <div className="text-sm text-gray-500">
        <p>Showing <strong className="text-gray-700 dark:text-slate-200">{start}–{end}</strong> of <strong className="text-gray-700 dark:text-slate-200">{page.totalElements}</strong></p>
      </div>
      <nav className="flex items-center gap-1.5" aria-label="Table pagination">
        <Button variant="secondary" className="px-3" disabled={page.first} onClick={() => onPageChange(page.number - 1)} aria-label="Previous page">
          <FiChevronLeft />
        </Button>
        {pages.map((item) => typeof item === "string"
          ? <span key={item} className="px-1 text-gray-400" aria-hidden="true">…</span>
          : <Button key={item} variant={item === page.number ? "primary" : "secondary"} className="min-w-10 px-3" onClick={() => onPageChange(item)} aria-label={`Page ${item + 1}`} aria-current={item === page.number ? "page" : undefined}>{item + 1}</Button>)}
        <Button variant="secondary" className="px-3" disabled={page.last} onClick={() => onPageChange(page.number + 1)} aria-label="Next page">
          <FiChevronRight />
        </Button>
      </nav>
    </div>
  );
};
