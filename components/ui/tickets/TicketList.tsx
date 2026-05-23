"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Ticket, Plus, Search, RefreshCw,
  Clock, AlertTriangle, CheckCircle, Circle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { apiGet } from '@/lib/client-api';
import { TicketItem } from './types';
import { TicketRow } from './TicketRow';

interface TicketsListProps {
  title: string;
  detailPath: string;       // '/admin/tickets' | '/agent/tickets' | '/user/tickets'
  createPath?: string;      // '/admin/create-ticket' | '/user/create-ticket'
  showAssigned?: boolean;   // admin/agent see assigned col, user doesn't
  badgeLabel?: string;
}

export function TicketsList({
  title,
  detailPath,
  createPath,
  showAssigned = true,
  badgeLabel = 'Ticket Management',
}: TicketsListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchTickets = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tickets?page=1&pageSize=50${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const result = await apiGet<any>(url);
      if (result.success && result.data) {
        const data = result.data as any;
        const items: TicketItem[] = Array.isArray(data) ? data : data.items || [];
        setTickets(items);
        setTotalCount(Array.isArray(data) ? data.length : data.totalCount || items.length);
      } else {
        toast(result.error || 'Failed to load tickets', 'error');
      }
    } catch {
      toast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTickets(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchTickets]);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => ['open', 'new'].some(k => t.statusCode?.toLowerCase().includes(k))).length,
    inProgress: tickets.filter(t => t.statusCode?.toLowerCase().includes('progress')).length,
    resolved: tickets.filter(t => ['resolved', 'closed'].some(k => t.statusCode?.toLowerCase().includes(k))).length,
    breached: tickets.filter(t => t.isResolutionBreached).length,
  };

  const headers = [
    'Ticket #', 'Title', 'Category', 'Requester',
    ...(showAssigned ? ['Assigned To'] : []),
    'Priority', 'Status', 'Created', '',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">
            {badgeLabel}
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter">{title}</h1>
          <p className="text-muted-foreground font-medium">{totalCount} ticket{totalCount !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm"
            />
          </div>
          <Button variant="outline" onClick={() => fetchTickets(searchQuery)} className="h-12 rounded-2xl px-4" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {createPath && (
            <Button onClick={() => router.push(createPath)} className="h-12 rounded-2xl px-6 gap-2 font-black shadow-2xl shadow-primary/20">
              <Plus className="w-5 h-5" /> Create Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Ticket, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Open', value: stats.open, icon: Circle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'SLA Breached', value: stats.breached, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map(stat => (
          <Card key={stat.label} className="border-none shadow-md bg-card/50 rounded-2xl">
            <CardContent className="p-5">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground">
              <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin opacity-40" />
              <p>Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Ticket className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No tickets found</p>
              <p className="text-sm mt-1">
                {searchQuery ? 'Try a different search' : 'No tickets available yet'}
              </p>
              {createPath && (
                <Button onClick={() => router.push(createPath)} className="mt-6 gap-2">
                  <Plus className="w-4 h-4" /> Create Ticket
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    {headers.map(h => (
                      <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {tickets.map(ticket => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      detailPath={detailPath}
                      showAssigned={showAssigned}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}