'use client';
import type { ComponentType, ReactNode, SVGProps } from 'react';

type Props = {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyTitle: string;
  emptyDescription: string;
  EmptyIcon: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
};

export default function ApprovalListState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  EmptyIcon,
  children,
}: Props) {
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 sm:p-4">
        <h3 className="text-xs font-medium text-red-800 sm:text-sm">Error</h3>
        <p className="mt-1 break-words text-xs text-red-700 sm:text-sm">{error}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="py-10 text-center">
        <EmptyIcon className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
        <h3 className="mt-2 text-xs font-medium text-gray-900 sm:text-sm">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">{emptyDescription}</p>
      </div>
    );
  }

  return <>{children}</>;
}
