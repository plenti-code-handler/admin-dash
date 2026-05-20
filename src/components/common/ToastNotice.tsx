'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastVariant = 'success' | 'error';

export type ToastState = {
  message: string;
  variant: ToastVariant;
};

type Props = {
  toast: ToastState | null;
  onDismiss: () => void;
  durationMs?: number;
};

export default function ToastNotice({ toast, onDismiss, durationMs = 4000 }: Props) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss, durationMs]);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.variant === 'success';

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
          isSuccess
            ? 'border-green-200 bg-green-50 text-green-900'
            : 'border-red-200 bg-red-50 text-red-900'
        }`}
      >
        {isSuccess ? (
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        ) : (
          <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}
        <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
