export interface SupportTicketTimelineEntry {
  transaction_type: string;
  created_at: number;
  notes: string | null;
}

export interface SuperUserSupportTicket {
  id: string;
  order_id: string | null;
  user_id: string | null;
  user_name: string | null;
  user_phone: string | null;
  vendor_id: string | null;
  vendor_name: string | null;
  vendor_phone: string | null;
  checkout_id: string | null;
  ticket_type: string | null;
  description: string | null;
  images: string | null;
  timeline: SupportTicketTimelineEntry[];
  created_at: number;
}

export interface SuperUserSupportTicketUpdateBody {
  description: string;
  update_type: 'resolve' | 'update';
}
