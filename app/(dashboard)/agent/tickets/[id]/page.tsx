"use client";
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/ui/tickets/TicketDetail';
import { TicketsList } from '@/components/ui/tickets/TicketList';

export default function AgentTicketDetailPage() {
  const params = useParams();
  return (
    <div className="relative min-h-screen flex w-full">
      <div className="flex-1 min-w-0">
        <TicketsList
          title="My Queue"
          detailPath="/agent/tickets"
          showAssigned={true}
          badgeLabel="Agent Queue"
        />
      </div>
      <TicketDetail
        ticketId={params?.id as string}
        backPath="/agent/queue"
        canAssign={false}
        canChangeStatus={true}
        showInternalNotes={true}
      />
    </div>
  );
}   