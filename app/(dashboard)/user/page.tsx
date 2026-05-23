"use client";
import { TicketsList } from '@/components/ui/tickets/TicketList';

export default function UserTicketsPage() {
  return (
    <TicketsList
      title="My Tickets"
      detailPath="/user/tickets"
      createPath="/user/create-ticket"
      showAssigned={false}
      badgeLabel="My Requests"
    />
  );
}