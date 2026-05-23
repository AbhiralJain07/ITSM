"use client";
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/ui/tickets/TicketDetail';

export default function AgentTicketDetailPage() {
  const params = useParams();
  return (
    <TicketDetail
      ticketId={params?.id as string}
      backPath="/agent/tickets"
      canAssign={false}
      canChangeStatus={true}
      showInternalNotes={true}
    />
  );
}   