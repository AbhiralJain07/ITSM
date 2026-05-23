"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  User,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
  UserCheck,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { apiGet, apiPost } from '@/lib/client-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketDetail {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  departmentId: string;
  categoryName: string;
  subCategoryName: string;
  requesterName: string;
  assignedUserId: string;
  assignedUserName: string;
  statusId: string;
  statusName: string;
  statusCode: string;
  priorityName: string;
  priorityCode: string;
  sourceName: string;
  slaName: string;
  createdAt: string;
  updatedAt: string;
  firstResponseDueAt: string;
  resolutionDueAt: string;
  isFirstResponseBreached: boolean;
  isResolutionBreached: boolean;
  comments: Comment[];
  attachments: any[];
}

interface Comment {
  id: string;
  authorName: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

interface DropdownItem {
  id: string;
  name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Dropdowns
  const [users, setUsers] = useState<DropdownItem[]>([]);
  const [statuses, setStatuses] = useState<DropdownItem[]>([]);

  // Actions
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [selectedUser, setSelectedUser] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const result = await apiGet<any>(`/api/tickets/${ticketId}`);
      if (result.success && result.data) {
        const data = result.data as any;
        const ticketData = data?.elements || data;
        setTicket(ticketData);
        setSelectedStatus(ticketData.statusId || '');
        setSelectedUser(ticketData.assignedUserId || '');
      } else {
        toast(result.error || 'Failed to load ticket', 'error');
      }
    } catch {
      toast('Failed to load ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [usersResult, masterTypesResult] = await Promise.all([
        apiGet<DropdownItem[]>('/api/users'),
        apiGet<any[]>('/api/mastertypes'),
      ]);

      if (usersResult.success && usersResult.data) {
        setUsers((usersResult.data as any[]).map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName,
        })));
      }

      // Fetch status masterdata
      if (masterTypesResult.success && masterTypesResult.data) {
        const statusType = masterTypesResult.data.find((t: any) =>
          t.name?.toLowerCase().includes('status') || t.code?.toLowerCase().includes('status')
        );
        if (statusType) {
          const statusResult = await apiGet<any[]>(`/api/masterdata?masterTypeId=${statusType.id}`);
          if (statusResult.success && statusResult.data) {
            setStatuses((statusResult.data as any[]).map((s: any) => ({ id: s.id, name: s.name })));
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchDropdowns();
    }
  }, [ticketId]);

  // ─── Actions ────────────────────────────────────────────────────

  const handleAddComment = async () => {
    if (!commentBody.trim()) return toast('Comment likhna zaroori hai', 'error');
    setCommentSubmitting(true);
    try {
      const result = await apiPost(`/api/tickets/${ticketId}/comments`, {
        body: commentBody.trim(),
        isInternal,
      });
      if (result.success) {
        toast('Comment added!', 'success');
        setCommentBody('');
        setIsInternal(false);
        fetchTicket();
      } else {
        toast(result.error || 'Failed to add comment', 'error');
      }
    } catch {
      toast('Failed to add comment', 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return toast('Status select karo', 'error');
    setStatusSubmitting(true);
    try {
      const result = await apiPost(`/api/tickets/${ticketId}/status`, {
        statusId: selectedStatus,
        reason: statusReason,
      });
      if (result.success) {
        toast('Status updated!', 'success');
        setStatusReason('');
        fetchTicket();
      } else {
        toast(result.error || 'Failed to update status', 'error');
      }
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setAssignSubmitting(true);
    try {
      const result = await apiPost(`/api/tickets/${ticketId}/assign`, {
        assignedUserId: selectedUser || null,
        reason: assignReason,
      });
      if (result.success) {
        toast(selectedUser ? 'Ticket assigned!' : 'Ticket unassigned!', 'success');
        setAssignReason('');
        fetchTicket();
      } else {
        toast(result.error || 'Failed to assign ticket', 'error');
      }
    } catch {
      toast('Failed to assign ticket', 'error');
    } finally {
      setAssignSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg font-bold">Ticket not found</p>
        <Button onClick={() => router.back()} className="mt-4 gap-2" variant="outline">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono text-sm font-bold text-primary">{ticket.ticketNumber}</span>
              {ticket.isResolutionBreached && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertTriangle className="w-3 h-3" /> SLA Breached
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-black tracking-tight">{ticket.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">Created {formatDate(ticket.createdAt)}</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchTicket} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ticket.description || '—'}
              </p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({ticket.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(ticket.comments || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
              ) : (
                ticket.comments.map(comment => (
                  <div key={comment.id} className={`p-4 rounded-xl border ${comment.isInternal ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/30 border-border/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{comment.authorName || 'Unknown'}</span>
                      <div className="flex items-center gap-2">
                        {comment.isInternal && (
                          <Badge variant="warning" className="text-[10px]">Internal</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.body}</p>
                  </div>
                ))
              )}

              {/* Add Comment */}
              <div className="pt-4 border-t border-border/50 space-y-3">
                <textarea
                  placeholder="Write a comment..."
                  value={commentBody}
                  onChange={e => setCommentBody(e.target.value)}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    Internal Note
                  </label>
                  <Button onClick={handleAddComment} disabled={commentSubmitting} className="gap-2">
                    <Send className="w-4 h-4" />
                    {commentSubmitting ? 'Sending...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-4">

          {/* Ticket Info */}
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Ticket Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: 'Status', value: ticket.statusName ? <Badge variant={getStatusVariant(ticket.statusCode)}>{ticket.statusName}</Badge> : '—' },
                { label: 'Priority', value: ticket.priorityName ? <Badge variant={getPriorityVariant(ticket.priorityCode)}>{ticket.priorityName}</Badge> : '—' },
                { label: 'Category', value: ticket.categoryName || '—' },
                { label: 'Subcategory', value: ticket.subCategoryName || '—' },
                { label: 'Source', value: ticket.sourceName || '—' },
                { label: 'SLA', value: ticket.slaName || '—' },
                { label: 'Requester', value: ticket.requesterName || '—' },
                { label: 'Assigned To', value: ticket.assignedUserName || <span className="text-muted-foreground italic">Unassigned</span> },
                { label: 'Resolution Due', value: formatDate(ticket.resolutionDueAt) },
                { label: 'Last Updated', value: formatDate(ticket.updatedAt) },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground font-medium shrink-0">{row.label}</span>
                  <span className="font-semibold text-right">{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Change Status */}
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Change Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statuses.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select status"
              />
              <Input
                placeholder="Reason (optional)"
                value={statusReason}
                onChange={e => setStatusReason(e.target.value)}
              />
              <Button onClick={handleStatusChange} disabled={statusSubmitting} className="w-full gap-2">
                <CheckCircle className="w-4 h-4" />
                {statusSubmitting ? 'Updating...' : 'Update Status'}
              </Button>
            </CardContent>
          </Card>

          {/* Assign */}
          <Card className="border-none shadow-lg rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> Assign Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={selectedUser}
                onChange={setSelectedUser}
                options={[{ value: '', label: 'Unassign' }, ...users.map(u => ({ value: u.id, label: u.name }))]}
                placeholder="Select user"
              />
              <Input
                placeholder="Reason (optional)"
                value={assignReason}
                onChange={e => setAssignReason(e.target.value)}
              />
              <Button onClick={handleAssign} disabled={assignSubmitting} className="w-full gap-2">
                <User className="w-4 h-4" />
                {assignSubmitting ? 'Assigning...' : 'Assign'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}