'use client';

import { use } from 'react';
import SupportTicketView from '@/components/support/SupportTicketView';

type PageProps = {
  params: Promise<{ checkout_id: string }>;
};

export default function SupportTicketPage({ params }: PageProps) {
  const { checkout_id } = use(params);
  return <SupportTicketView checkoutId={checkout_id} />;
}
