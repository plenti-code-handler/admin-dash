/** Safe extraction of FastAPI/axios `detail` from a failed request. */
export function getApiErrorDetail(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data
      ?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
  }
  return fallback;
}

export function isAbortedRequest(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const e = error as { code?: string; name?: string };
  return e.name === 'CanceledError' || e.code === 'ERR_CANCELED' || e.name === 'AbortError';
}
