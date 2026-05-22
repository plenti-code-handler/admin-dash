/** Customer-facing notes for resolve / update on the support ticket page. */
export const SUPPORT_TICKET_UPDATE_TEMPLATES = [
  'Sorry for inconvenience caused, we are looking into the issue. We will revert back in 2 to 3 minutes.',
  'We are following up with the vendor. We will revert back in 2 to 3 minutes. Thanks for your patience.',
] as const;

export const SUPPORT_TICKET_TYPES = [
  { label: 'Quality issue', value: 'QUALITY_ISSUE' },
  { label: 'Quantity issue', value: 'QUANTITY_ISSUE' },
  { label: 'Pickup related issue', value: 'PICKUP_ISSUE' },
  { label: 'Restaurant staff related', value: 'STAFF_ISSUE' },
] as const;

/** Inactive order transaction types (`TransactionState.order`) eligible for superuser raise-ticket. */
export const ORDER_STATUSES_ELIGIBLE_FOR_SUPPORT_TICKET_RAISE = [
  'order.cancelled',
  'order.not_picked_up',
  'order.picked_up',
  'order.donated',
] as const;

export function canRaiseSupportTicketForOrder(
  ticketStatus: string | null | undefined,
  orderStatus: string | null | undefined
): boolean {
  if (ticketStatus != null && ticketStatus !== '') return false;
  if (!orderStatus) return false;
  return (ORDER_STATUSES_ELIGIBLE_FOR_SUPPORT_TICKET_RAISE as readonly string[]).includes(
    orderStatus
  );
}
