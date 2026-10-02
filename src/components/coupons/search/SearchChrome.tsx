export function SearchSkeleton() {
  return (
    <ul className="divide-y divide-gray-100 border-t border-gray-100" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <span className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-100" />
          <span className="min-w-0 flex-1 space-y-1.5">
            <span className="block h-3.5 w-2/5 animate-pulse rounded bg-gray-100" />
            <span className="block h-3 w-3/5 animate-pulse rounded bg-gray-100" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SearchPager({
  page,
  canGoBack,
  hasMore,
  busy,
  onPrevious,
  onNext,
}: {
  page: number;
  canGoBack: boolean;
  hasMore: boolean;
  busy: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!hasMore && !canGoBack) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2 sm:px-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoBack || busy}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-xs text-gray-500">Page {page}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasMore || busy}
        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
