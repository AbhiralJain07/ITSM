"use client";
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/ui/tickets/TicketDetail';

export default function UserTicketDetailPage() {
  const params = useParams();
  return (
    <TicketDetail
      ticketId={params?.id as string}
      backPath="/user/tickets"
      canAssign={false}
      canChangeStatus={false}
      showInternalNotes={false}
    />
  );
}