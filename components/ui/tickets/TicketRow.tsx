"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TicketItem } from './types';
import { formatDate, getStatusVariant, getPriorityVariant } from './helpers';

interface TicketRowProps {
  ticket: TicketItem;
  detailPath: string; // e.g. '/admin/tickets' or '/agent/tickets'
  showAssigned?: boolean;
}

export function TicketRow({ ticket, detailPath, showAssigned = true }: TicketRowProps) {
  const router = useRouter();

  return (
    <tr
      className="hover:bg-primary/[0.03] transition-all group cursor-pointer"
      onClick={() => router.push(`${detailPath}/${ticket.id}`)}
    >
      <td className="px-6 py-4">
        <span className="font-mono text-xs font-bold text-primary">
          {ticket.ticketNumber || '—'}
        </span>
      </td>
      <td className="px-6 py-4 max-w-[220px]">
        <p className="font-semibold text-sm truncate">{ticket.title}</p>
        {ticket.isResolutionBreached && (
          <span className="text-[10px] text-destructive font-bold flex items-center gap-1 mt-0.5">
            <AlertTriangle className="w-3 h-3" /> SLA Breached
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-muted-foreground">
          <p>{ticket.categoryName || '—'}</p>
          {ticket.subCategoryName && (
            <p className="text-xs opacity-60">{ticket.subCategoryName}</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm">{ticket.requesterName || '—'}</span>
      </td>
      {showAssigned && (
        <td className="px-6 py-4">
          <span className="text-sm">
            {ticket.assignedUserName || (
              <span className="text-muted-foreground italic text-xs">Unassigned</span>
            )}
          </span>
        </td>
      )}
      <td className="px-6 py-4">
        {ticket.priorityName ? (
          <Badge variant={getPriorityVariant(ticket.priorityCode)} className="text-xs font-bold">
            {ticket.priorityName}
          </Badge>
        ) : <span className="text-muted-foreground text-sm">—</span>}
      </td>
      <td className="px-6 py-4">
        {ticket.statusName ? (
          <Badge variant={getStatusVariant(ticket.statusCode)} className="text-xs font-bold">
            {ticket.statusName}
          </Badge>
        ) : <span className="text-muted-foreground text-sm">—</span>}
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(ticket.createdAt)}
        </span>
      </td>
      <td className="px-6 py-4">
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </td>
    </tr>
  );
}