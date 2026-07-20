import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "./Button";

export const Pagination = ({ page, onPageChange }) => {
  if (!page || page.totalPages <= 1) return null;
  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-gray-500">
        {page.totalElements} records · Page {page.number + 1} of {page.totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" className="px-3" disabled={page.first} onClick={() => onPageChange(page.number - 1)} aria-label="Previous page">
          <FiChevronLeft />
        </Button>
        <Button variant="secondary" className="px-3" disabled={page.last} onClick={() => onPageChange(page.number + 1)} aria-label="Next page">
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};
