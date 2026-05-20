'use client';

import { useCallback, useState } from 'react';
import type { ToastState } from '@/components/common/ToastNotice';

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismiss = useCallback(() => setToast(null), []);

  const showSuccess = useCallback((message: string) => {
    setToast({ message, variant: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ message, variant: 'error' });
  }, []);

  return { toast, dismiss, showSuccess, showError };
}
