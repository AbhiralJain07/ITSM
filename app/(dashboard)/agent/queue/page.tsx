"use client";
import { TicketsList } from '@/components/ui/tickets/TicketList';

export default function AgentQueuePage() {
  return (
    <TicketsList
      title="My Queue"
      detailPath="/agent/tickets"
      showAssigned={true}
      badgeLabel="Agent Queue"
    />
  );
}