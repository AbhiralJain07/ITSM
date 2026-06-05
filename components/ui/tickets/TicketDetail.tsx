"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, AlertTriangle, MessageSquare,
  Send, UserCheck, Activity, CheckCircle, User, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { apiGet, apiPost } from '@/lib/client-api';
import { TicketItem, DropdownItem } from './types';
import { formatDate, getStatusVariant, getPriorityVariant } from './helpers';

interface TicketDetailProps {
  ticketId: string;
  backPath: string;
  canAssign?: boolean;    // admin only
  canChangeStatus?: boolean; // admin + agent
  showInternalNotes?: boolean; // admin + agent
}

export function TicketDetail({
  ticketId,
  backPath,
  canAssign = false,
  canChangeStatus = false,
  showInternalNotes = false,
}: TicketDetailProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<DropdownItem[]>([]);
  const [statuses, setStatuses] = useState<DropdownItem[]>([]);

  // Comment state
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Status state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Assign state
  const [selectedUser, setSelectedUser] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiGet<any>(`/api/tickets/${ticketId}`);
      if (result.success && result.data) {
        const data = result.data as any;
        const t = data?.elements || data;
        setTicket(t);
        setSelectedStatus(t.statusId || '');
        setSelectedUser(t.assignedUserId || '');
      } else {
        toast(result.error || 'Failed to load ticket', 'error');
      }
    } catch {
      toast('Failed to load ticket', 'error');
    } finally {
      setLoading(false);
    }
  }, [ticketId, toast]);

  const fetchDropdowns = useCallback(async () => {
    try {
      if (canAssign) {
        const usersResult = await apiGet<any[]>('/api/users');
        if (usersResult.success && usersResult.data) {
          setUsers((usersResult.data as any[]).map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName,
          })));
        }
      }

      if (canChangeStatus) {
        const typesResult = await apiGet<any[]>('/api/mastertypes');
        if (typesResult.success && typesResult.data) {
          const statusType = typesResult.data.find((t: any) =>
            t.name?.toLowerCase().includes('status') || t.code?.toLowerCase().includes('status')
          );
          if (statusType) {
            const statusResult = await apiGet<any[]>(`/api/masterdata?masterTypeId=${statusType.id}`);
            if (statusResult.success && statusResult.data) {
              setStatuses((statusResult.data as any[]).map((s: any) => ({ id: s.id, name: s.name })));
            }
          }
        }
      }
    } catch {}
  }, [canAssign, canChangeStatus]);

  useEffect(() => {
    fetchTicket();
    fetchDropdowns();
  }, [fetchTicket, fetchDropdowns]);

  // ─── Actions ──────────────────────────────────────────────────────

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
    if (!selectedStatus) return toast(' select Status', 'error');
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

  // ─── Render ───────────────────────────────────────────────────────

  const infoRows = ticket ? [
    { label: 'Status', value: ticket.statusName ? <Badge variant={getStatusVariant(ticket.statusCode)}>{ticket.statusName}</Badge> : '—' },
    { label: 'Priority', value: ticket.priorityName ? <Badge variant={getPriorityVariant(ticket.priorityCode)}>{ticket.priorityName}</Badge> : '—' },
    { label: 'Category', value: ticket.categoryName || '—' },
    { label: 'Subcategory', value: ticket.subCategoryName || '—' },
    { label: 'Source', value: ticket.sourceName || '—' },
    { label: 'SLA', value: ticket.slaName || '—' },
    { label: 'Requester', value: ticket.requesterName || '—' },
    { label: 'Assigned To', value: ticket.assignedUserName || <span className="text-muted-foreground italic text-xs">Unassigned</span> },
    { label: 'Resolution Due', value: formatDate(ticket.resolutionDueAt) },
    { label: 'Last Updated', value: formatDate(ticket.updatedAt) },
  ] : [];

  // Filter comments based on role
  const visibleComments = ticket ? (ticket.comments || []).filter(c =>
    showInternalNotes ? true : !c.isInternal
  ) : [];

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] md:w-full md:max-w-[700px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-40 flex flex-col overflow-hidden"
    >
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => router.push(backPath)}
          className="rounded-full h-9 w-9 border border-slate-200/50 text-slate-500 hover:text-slate-800 transition-all duration-150 shadow-sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-12 md:pb-16 space-y-6">
        {loading ? (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Loading ticket details...</p>
        </div>
      ) : !ticket ? (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <p className="text-lg font-bold text-slate-900">Ticket not found</p>
          <p className="text-sm text-slate-500 mt-1">This ticket does not exist or was deleted.</p>
          <Button onClick={() => router.push(backPath)} className="mt-6 gap-2" variant="outline">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
        </div>
      ) : (
        <>
          {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={() => router.push(backPath)}>
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

      <div className="space-y-6">
        {/* Ticket Info */}
        <Card className="border-none shadow-lg rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Ticket Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {infoRows.map(row => (
              <div key={row.label} className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground font-medium shrink-0">{row.label}</span>
                <span className="font-semibold text-right">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Change Status */}
        {canChangeStatus && (
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
        )}

        {/* Assign */}
        {canAssign && (
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
        )}

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
              Comments ({visibleComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              visibleComments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-xl border ${
                    comment.isInternal
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-muted/30 border-border/50'
                  }`}
                >
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
                {showInternalNotes && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={e => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    Internal Note
                  </label>
                )}
                {!showInternalNotes && <span />}
                <Button onClick={handleAddComment} disabled={commentSubmitting} className="gap-2">
                  <Send className="w-4 h-4" />
                  {commentSubmitting ? 'Sending...' : 'Add Comment'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </>
      )}
      </div>
    </motion.div>
  );
}