"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  User,
  Tag,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Send,
  UserCheck,
  Activity,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { apiGet, apiPost, apiPut } from '@/lib/client-api';

interface TicketDetail {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  departmentId: string;
  categoryId?: string;
  categoryName: string;
  subCategoryId?: string;
  subCategoryName: string;
  requesterName: string;
  assignedUserId: string;
  assignedUserName: string;
  statusId: string;
  statusName: string;
  statusCode: string;
  priorityId?: string;
  priorityName: string;
  priorityCode: string;
  sourceId?: string;
  sourceName: string;
  slaId?: string;
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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<DropdownItem[]>([]);
  const [statuses, setStatuses] = useState<DropdownItem[]>([]);
  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<DropdownItem[]>([]);
  const [sources, setSources] = useState<DropdownItem[]>([]);
  const [slas, setSlas] = useState<DropdownItem[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editSla, setEditSla] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [selectedUser, setSelectedUser] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(false);
  const [showAssignPanel, setShowAssignPanel] = useState(false);

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

  const fetchMasterDataByType = async (typeName: string): Promise<DropdownItem[]> => {
    try {
      const typesResult = await apiGet<any[]>('/api/mastertypes');
      if (!typesResult.success || !typesResult.data) return [];

      const search = typeName.toLowerCase();
      const masterType = typesResult.data.find((t: any) =>
        t.name?.toLowerCase().includes(search) ||
        search.includes(t.name?.toLowerCase()) ||
        t.code?.toLowerCase().includes(search) ||
        search.includes(t.code?.toLowerCase())
      );
      if (!masterType) return [];

      const result = await apiGet<any[]>(`/api/masterdata?masterTypeId=${masterType.id}`);
      if (!result.success || !result.data) return [];
      return (result.data as any[]).filter((i: any) => i.isActive !== false).map((item: any) => ({ id: item.id, name: item.name }));
    } catch {
      return [];
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [usersResult, categoriesResult, subCategoriesResult] = await Promise.all([
        apiGet<DropdownItem[]>('/api/users'),
        apiGet<DropdownItem[]>('/api/categories'),
        apiGet<any[]>('/api/subcategories'),
      ]);

      if (usersResult.success && usersResult.data) {
        setUsers((usersResult.data as any[]).map((u: any) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.userName,
        })));
      }
      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      if (subCategoriesResult.success && subCategoriesResult.data) {
        setSubCategories(subCategoriesResult.data);
      }

      const [priorityItems, sourceItems, statusItems] = await Promise.all([
        fetchMasterDataByType('priority'),
        fetchMasterDataByType('source'),
        fetchMasterDataByType('TICKET_STATUS_V2'),
      ]);
      setPriorities(priorityItems);
      setSources(sourceItems);
      setStatuses(statusItems);

      const slaResult = await apiGet<DropdownItem[]>('/api/sla-configurations');
      if (slaResult.success && slaResult.data) {
        setSlas(slaResult.data);
      }
    } catch {
      // ignore
    }
  };

  const fetchTimeline = async () => {
    try {
      const result = await apiGet<any[]>(`/api/tickets/${ticketId}/timeline`);
      if (result.success && result.data) {
        setTimeline(result.data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
      fetchDropdowns();
      fetchTimeline();
    }
  }, [ticketId]);

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

  const filteredEditSubCategories = editCategory
    ? subCategories.filter((s: any) => s.categoryId === editCategory)
    : [];

  const handleUpdateTicket = async () => {
    const payload: Record<string, string | null> = {};

    if (editTitle.trim()) payload.title = editTitle.trim();
    if (editDescription.trim()) payload.description = editDescription.trim();
    if (editCategory) payload.categoryId = editCategory;
    if (editSubCategory) payload.subCategoryId = editSubCategory;
    if (editPriority) payload.priorityId = editPriority;
    if (editSource) payload.sourceId = editSource;
    if (editSla) payload.slaId = editSla;

    if (Object.keys(payload).length === 0) {
      return toast('Please select at least one field to update', 'error');
    }

    setEditSubmitting(true);
    try {
      const result = await apiPut(`/api/tickets/${ticketId}`, payload);
      if (result.success) {
        toast('Ticket updated successfully!', 'success');
        fetchTicket();
      } else {
        toast(result.error || 'Failed to update ticket', 'error');
      }
    } catch {
      toast('Failed to update ticket', 'error');
    } finally {
      setEditSubmitting(false);
    }
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4">
      <div className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
        >
          <div className="absolute right-4 top-4 z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full p-2 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Ticket Info</span>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {ticket.ticketNumber}
                  </span>
                  {ticket.isResolutionBreached && (
                    <Badge variant="destructive" className="text-xs gap-1">
                      <AlertTriangle className="w-3 h-3" /> SLA Breached
                    </Badge>
                  )}
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{ticket.title}</h1>
                <p className="mt-2 text-sm text-slate-500">Created {formatDate(ticket.createdAt)}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={fetchTicket} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Close
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Ticket Info</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700">
                  {[
                    { label: 'Status', value: ticket.statusName || '—' },
                    { label: 'Priority', value: ticket.priorityName || '—' },
                    { label: 'Category', value: ticket.categoryName || '—' },
                    { label: 'Subcategory', value: ticket.subCategoryName || '—' },
                    { label: 'Source', value: ticket.sourceName || '—' },
                    { label: 'SLA', value: ticket.slaName || '—' },
                    { label: 'Requester', value: ticket.requesterName || '—' },
                    { label: 'Assigned To', value: ticket.assignedUserName || 'Unassigned' },
                    { label: 'Created At', value: formatDate(ticket.createdAt) },
                    { label: 'Updated At', value: formatDate(ticket.updatedAt) },
                    { label: 'First Response Due', value: formatDate(ticket.firstResponseDueAt) },
                    { label: 'Resolution Due', value: formatDate(ticket.resolutionDueAt) },
                  ].map(row => (
                    <div key={row.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{row.label}</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{row.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-none shadow-lg rounded-3xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowEditPanel(prev => !prev)}
                      className="w-full bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-primary hover:text-white"
                    >
                      {showEditPanel ? 'Hide Edit Ticket' : 'Edit Ticket'}
                    </Button>
                    <Button onClick={() => setShowStatusPanel(prev => !prev)} variant="outline" className="w-full">
                      {showStatusPanel ? 'Hide Change Status' : 'Change Status'}
                    </Button>
                    <Button onClick={() => setShowAssignPanel(prev => !prev)} variant="ghost" className="w-full">
                      {showAssignPanel ? 'Hide Assign Ticket' : 'Assign Ticket'}
                    </Button>
                  </CardContent>
                </Card>

                {showEditPanel && (
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Edit Ticket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current title</div>
                        <p className="text-sm text-slate-700">{ticket.title || '—'}</p>
                      </div>
                      <Input placeholder="Enter new title" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current description</div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description || '—'}</p>
                      </div>
                      <textarea
                        placeholder="Enter new description"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        rows={4}
                        className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current category</div>
                        <p className="text-sm text-slate-700">{ticket.categoryName || '—'}</p>
                      </div>
                      <Select
                        value={editCategory}
                        onChange={value => {
                          setEditCategory(value);
                          if (value !== editCategory) setEditSubCategory('');
                        }}
                        options={categories.map(c => ({ value: c.id, label: c.name }))}
                        placeholder="Choose a new category"
                      />
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current subcategory</div>
                        <p className="text-sm text-slate-700">{ticket.subCategoryName || '—'}</p>
                      </div>
                      <Select
                        value={editSubCategory}
                        onChange={setEditSubCategory}
                        options={filteredEditSubCategories.map((s: any) => ({ value: s.id, label: s.name }))}
                        placeholder="Choose a new subcategory"
                        disabled={!editCategory}
                      />
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current priority</div>
                        <p className="text-sm text-slate-700">{ticket.priorityName || '—'}</p>
                      </div>
                      <Select
                        value={editPriority}
                        onChange={setEditPriority}
                        options={priorities.map(p => ({ value: p.id, label: p.name }))}
                        placeholder="Choose a new priority"
                      />
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current source</div>
                        <p className="text-sm text-slate-700">{ticket.sourceName || '—'}</p>
                      </div>
                      <Select
                        value={editSource}
                        onChange={setEditSource}
                        options={sources.map(s => ({ value: s.id, label: s.name }))}
                        placeholder="Choose a new source"
                      />
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Current SLA</div>
                        <p className="text-sm text-slate-700">{ticket.slaName || '—'}</p>
                      </div>
                      <Select
                        value={editSla}
                        onChange={setEditSla}
                        options={slas.map(s => ({ value: s.id, label: s.name }))}
                        placeholder="Choose a new SLA"
                      />
                      <Button onClick={handleUpdateTicket} disabled={editSubmitting} className="w-full gap-2">
                        {editSubmitting ? 'Updating...' : 'Update Ticket'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {showStatusPanel && (
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Change Status</CardTitle>
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
                        {statusSubmitting ? 'Updating...' : 'Update Status'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {showAssignPanel && (
                  <Card className="border-none shadow-lg rounded-3xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold">Assign Ticket</CardTitle>
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
                        {assignSubmitting ? 'Assigning...' : 'Assign Ticket'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description || '—'}</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg rounded-3xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold">History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {timeline.length === 0 ? (
                    <p className="text-sm text-slate-500">No history available.</p>
                  ) : (
                    <div className="space-y-3">
                      {timeline.map((item, index) => (
                        <div key={item.id || index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <span>{item.event || item.action || item.type || 'Update'}</span>
                            <span>{formatDate(item.timestamp || item.createdAt || item.date)}</span>
                          </div>
                          <div className="mt-2 text-sm text-slate-800">
                            {item.description || item.details || item.message || JSON.stringify(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-none shadow-lg rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Comments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(ticket.comments || []).length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No comments yet.</p>
                ) : (
                  ticket.comments.map(comment => (
                    <div key={comment.id} className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 ${comment.isInternal ? 'ring-1 ring-amber-500/20' : ''}`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{comment.authorName || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                        </div>
                        {comment.isInternal && (
                          <Badge variant="warning" className="text-[10px]">Internal Note</Badge>
                        )}
                      </div>
                      <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">{comment.body}</p>
                    </div>
                  ))
                )}

                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <textarea
                    placeholder="Write a comment..."
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    rows={3}
                    className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
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
        </motion.div>
      </div>
    </div>
  );
}
