"use client";
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/ui/tickets/TicketDetail';
import { TicketsList } from '@/components/ui/tickets/TicketList';

export default function UserTicketDetailPage() {
  const params = useParams();
  return (
    <div className="relative min-h-screen flex w-full">
      <div className="flex-1 min-w-0">
        <TicketsList
          title="My Tickets"
          detailPath="/user/tickets"
          createPath="/user/create-ticket"
          showAssigned={false}
          badgeLabel="My Requests"
        />
      </div>
      <TicketDetail
        ticketId={params?.id as string}
        backPath="/user/tickets"
        canAssign={false}
        canChangeStatus={false}
        showInternalNotes={false}
      />
    </div>
  );
}