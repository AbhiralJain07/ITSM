"use client";
import { TicketsList } from '@/components/ui/tickets/TicketList';

export default function AdminTicketsPage() {
  return (
    <TicketsList
      title="All Tickets"
      detailPath="/admin/tickets"
      createPath="/admin/create-ticket"
      showAssigned={true}
      badgeLabel="Ticket Management"
    />
  );
}