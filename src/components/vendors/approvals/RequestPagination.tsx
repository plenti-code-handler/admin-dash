'use client';

type Props = {
  skip: number;
  pageSize: number;
  resultCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function RequestPagination({
  skip,
  pageSize,
  resultCount,
  onPrevious,
  onNext,
}: Props) {
  const currentPage = Math.floor(skip / pageSize) + 1;
  const hasMore = resultCount === pageSize;
  if (!hasMore && skip === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={skip === 0}
        className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
      >
        Previous
      </button>
      <span className="text-xs text-gray-700 sm:text-sm">Page {currentPage}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasMore}
        className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
      >
        Next
      </button>
    </div>
  );
}
