import React from "react";
import { FiChevronDown } from "react-icons/fi";

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 12,
  } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 py-4 text-sm font-medium">
      {/* Items Count */}
      <span className="text-gray-500">
        Showing {startIndex}-{endIndex} of {totalItems} items
      </span>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? "bg-action-gold text-white shadow-md scale-105"
                  : "text-gray-600 hover:bg-gray-100 hover:text-primary-teal"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Limit Selector */}
      {onLimitChange && (
        <div className="flex items-center gap-2 text-gray-500">
          <span>Show</span>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-3 py-1.5 pr-8 text-action-gold font-bold outline-none focus:border-action-gold cursor-pointer"
            >
              <option value={12}>12 rows</option>
              <option value={24}>24 rows</option>
              <option value={48}>48 rows</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
