import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  labels,
  className = '',
}) {
  if (!totalItems) return null;

  const safeTotalPages = Math.max(totalPages || 1, 1);

  return (
    <div className={`flex flex-col items-start justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:px-6 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {labels.page} <span className="text-slate-900">{currentPage}</span> {labels.of} <span className="text-slate-900">{safeTotalPages}</span>
        <span className="ml-2 opacity-50">•</span>
        <span className="ml-2">{totalItems} {labels.results}</span>
      </p>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          <ChevronLeft size={14} />
          {labels.previous}
        </button>
        <button
          type="button"
          disabled={currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {labels.next}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
