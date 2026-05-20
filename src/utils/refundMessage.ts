export function formatRefundPercent(multiplier: number): string {
  return `${Math.round(multiplier * 100)}%`;
}

/** Customer-facing note added to the support ticket after a refund. */
export function buildRefundResolutionNote(multiplier: number): string {
  const pct = formatRefundPercent(multiplier);
  return `We are extremely sorry for the inconvenience caused. As an action of courtesy, we have initiated a ${pct} refund of your order. The amount will be refunded to your original payment source within 5-7 business days.`;
}
