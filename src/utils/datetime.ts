const IST_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

/** Format Unix timestamp in seconds for display in the current locale. */
export function formatUnixSeconds(timestamp: number): string {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...IST_OPTIONS,
  });
}

/** Shorter IST label for compact UI (e.g. timeline cards). */
export function formatUnixSecondsCompact(timestamp: number): string {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    ...IST_OPTIONS,
  });
}
