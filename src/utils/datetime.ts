const IST_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

/** Unix seconds → `YYYY-MM-DDTHH:mm` in IST for datetime-local inputs. */
export function formatUnixForIstDatetimeLocal(
  timestamp: number | undefined | null
): string {
  if (timestamp == null || timestamp === 0) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(timestamp * 1000));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** datetime-local value (IST wall clock) → Unix seconds. */
export function parseIstDatetimeLocal(value: string): number | undefined {
  if (!value) return undefined;
  const ms = new Date(`${value}+05:30`).getTime();
  if (Number.isNaN(ms)) return undefined;
  return Math.floor(ms / 1000);
}

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
