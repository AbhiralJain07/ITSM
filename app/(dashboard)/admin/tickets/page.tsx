"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Filter,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { apiGet } from '@/lib/client-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  departmentId: string;
  categoryName: string;
  subCategoryName: string;
  requesterName: string;
  assignedUserName: string;
  statusName: string;
  statusCode: string;
  priorityName: string;
  priorityCode: string;
  sourceName: string;
  slaName: string;
  createdAt: string;
  updatedAt: string;
  isFirstResponseBreached: boolean;
  isResolutionBreached: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusVariant = (code: string) => {
  const c = code?.toLowerCase();
  if (c?.includes('open') || c?.includes('new')) return 'info';
  if (c?.includes('progress') || c?.includes('pending')) return 'warning';
  if (c?.includes('resolved') || c?.includes('closed')) return 'success';
  return 'secondary';
};

const getPriorityVariant = (code: string) => {
  const c = code?.toLowerCase();
  if (c?.includes('critical') || c?.includes('high')) return 'destructive';
  if (c?.includes('medium')) return 'warning';
  return 'secondary';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  // ─── Fetch ────────────────────────────────────────────────────────

  const fetchTickets = async (search = '') => {
    setLoading(true);
    try {
      const url = `/api/tickets?page=1&pageSize=50${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const result = await apiGet<any>(url);
      if (result.success && result.data) {
        const data = result.data as any;
        // Handle both array and paginated response
        const items = Array.isArray(data) ? data : data.items || [];
        const total = Array.isArray(data) ? data.length : data.totalCount || items.length;
        setTickets(items);
        setTotalCount(total);
      } else {
        toast(result.error || 'Failed to load tickets', 'error');
      }
    } catch {
      toast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchTickets(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Stats ────────────────────────────────────────────────────────

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.statusCode?.toLowerCase().includes('open') || t.statusCode?.toLowerCase().includes('new')).length,
    inProgress: tickets.filter(t => t.statusCode?.toLowerCase().includes('progress')).length,
    resolved: tickets.filter(t => t.statusCode?.toLowerCase().includes('resolved') || t.statusCode?.toLowerCase().includes('closed')).length,
    breached: tickets.filter(t => t.isResolutionBreached).length,
  };

  // ─── Render ───────────────────────────────────────────────────────

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
            Ticket Management
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter">All Tickets</h1>
          <p className="text-muted-foreground font-medium">
            {totalCount} ticket{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[280px]">
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
          <Button onClick={() => router.push('/admin/create-ticket')} className="h-12 rounded-2xl px-6 gap-2 font-black shadow-2xl shadow-primary/20">
            <Plus className="w-5 h-5" /> Create Ticket
          </Button>
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

      {/* Tickets Table */}
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
              <p className="text-sm mt-1">Create your first ticket to get started</p>
              <Button onClick={() => router.push('/admin/create-ticket')} className="mt-6 gap-2">
                <Plus className="w-4 h-4" /> Create Ticket
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    {['Ticket #', 'Title', 'Category', 'Requester', 'Assigned To', 'Priority', 'Status', 'Created', ''].map(h => (
                      <th key={h} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {tickets.map(ticket => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-primary/[0.03] transition-all group cursor-pointer"
                      onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-primary">
                          {ticket.ticketNumber || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
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
                            <p className="text-xs opacity-70">{ticket.subCategoryName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{ticket.requesterName || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{ticket.assignedUserName || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.priorityName ? (
                          <Badge variant={getPriorityVariant(ticket.priorityCode)} className="text-xs font-bold">
                            {ticket.priorityName}
                          </Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {ticket.statusName ? (
                          <Badge variant={getStatusVariant(ticket.statusCode)} className="text-xs font-bold">
                            {ticket.statusName}
                          </Badge>
                        ) : <span className="text-muted-foreground">—</span>}
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