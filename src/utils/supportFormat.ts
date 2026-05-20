/** e.g. ticket.created → Ticket Created */
export function formatTransactionType(transactionType: string): string {
  return transactionType
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatTicketType(ticketType: string | null | undefined): string {
  if (!ticketType) return '—';
  return ticketType
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

const TICKET_RESOLVED = 'ticket.resolved';

/** Latest timeline entry whose type starts with `ticket.` */
export function latestTicketTransactionType(
  timeline: { transaction_type: string; created_at: number }[]
): string | null {
  let latest: string | null = null;
  let latestAt = -1;
  for (const entry of timeline) {
    if (
      entry.transaction_type.startsWith('ticket.') &&
      entry.created_at >= latestAt
    ) {
      latest = entry.transaction_type;
      latestAt = entry.created_at;
    }
  }
  return latest;
}

export function isTicketUnresolved(
  timeline: { transaction_type: string; created_at: number }[]
): boolean {
  const latest = latestTicketTransactionType(timeline);
  return latest !== null && latest !== TICKET_RESOLVED;
}
