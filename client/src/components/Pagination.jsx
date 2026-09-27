import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center space-x-2">
        <span>
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{start}</span> to{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{end}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span> records
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {/* Rows per page dropdown */}
        <div className="flex items-center space-x-1.5 mr-3">
          <span>Rows:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page indicators */}
        <div className="flex items-center space-x-1">
          {[...Array(totalPages)].map((_, idx) => {
            const pageNumber = idx + 1;
            // Only show neighboring pages if totalPages is large
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= page - 1 && pageNumber <= page + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                    pageNumber === page
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            }
            if (
              (pageNumber === 2 && page > 3) ||
              (pageNumber === totalPages - 1 && page < totalPages - 2)
            ) {
              return <span key={pageNumber} className="px-1 text-slate-400">...</span>;
            }
            return null;
          })}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
