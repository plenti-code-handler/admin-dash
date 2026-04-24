/** Format Unix timestamp in seconds for display in the current locale. */
export function formatUnixSeconds(timestamp: number): string {
  if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    });
}
