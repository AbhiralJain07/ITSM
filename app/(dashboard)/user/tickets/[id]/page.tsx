"use client";
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/ui/tickets/TicketDetail';

export default function AdminTicketDetailPage() {
  const params = useParams();
  return (
    <TicketDetail
      ticketId={params?.id as string}
      backPath="/admin/tickets"
      canAssign={true}
      canChangeStatus={true}
      showInternalNotes={true}
    />
  );
}