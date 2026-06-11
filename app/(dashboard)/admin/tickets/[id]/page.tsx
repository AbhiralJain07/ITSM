"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TicketsList } from '@/components/ui/tickets/TicketList';
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
  Copy,
  Check,
  Calendar,
  Clock,
  Mail,
  Globe,
  Layers,
  Edit,
  ShieldAlert,
  History as HistoryIcon,
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
  if (c?.includes('critical') || c?.includes('high') || c?.includes('p0')) return 'destructive';
  if (c?.includes('medium') || c?.includes('p1')) return 'warning';
  return 'secondary';
};

const getInitials = (name?: string) => {
  if (!name || name === '—' || name.toLowerCase() === 'unassigned') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
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

  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast('Ticket ID copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

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
      const result = await apiGet<any>(`/api/tickets/${ticketId}/timeline`);
      if (result.success && result.data) {
        const timelineData = result.data;
        const entries = Array.isArray(timelineData)
          ? timelineData
          : timelineData?.elements && Array.isArray(timelineData.elements)
          ? timelineData.elements
          : [timelineData];
        setTimeline(entries);
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

  return (
    <div className="relative min-h-screen flex w-full">
      {/* Background Tickets List */}
      <div className="flex-1 min-w-0">
        <TicketsList
          title="All Tickets"
          detailPath="/admin/tickets"
          createPath="/admin/create-ticket"
          showAssigned={true}
          badgeLabel="Ticket Management"
        />
      </div>

      {/* Slide-over Drawer (fixed, right side) */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-4 right-4 bottom-4 w-[calc(100%-2rem)] xl:w-[660px] 2xl:w-[700px] bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-40 flex flex-col overflow-hidden"
      >
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => router.back()}
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
              <Button onClick={() => router.back()} className="mt-6 gap-2" variant="outline">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">ITSM Service Portal</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] font-semibold text-slate-400">Incident Details</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-700 shadow-sm group">
                    <span>{ticket.ticketNumber}</span>
                    <button
                      onClick={() => handleCopy(ticket.ticketNumber)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0.5"
                      title="Copy Ticket ID"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />}
                    </button>
                  </div>
                  {ticket.isResolutionBreached && (
                    <Badge variant="destructive" className="text-xs font-semibold gap-1 px-2.5 py-1 shadow-sm">
                      <ShieldAlert className="w-3.5 h-3.5" /> SLA Breached
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
                  {ticket.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created {formatDate(ticket.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 lg:self-end">
                <Button 
                  variant="outline" 
                  onClick={fetchTicket} 
                  className="group gap-2 h-9 text-xs font-semibold border-slate-200 bg-white text-slate-600 dark:text-slate-600 dark:bg-white dark:border-slate-200 hover:text-[#1E40AF] dark:hover:text-[#1E40AF] hover:border-[#1E40AF]/40 dark:hover:border-[#1E40AF]/40 hover:bg-[#EFF6FF]/60 dark:hover:bg-[#EFF6FF]/60 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/15 active:scale-[0.96] transition-all duration-200 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-[#1E40AF] group-hover:rotate-180 transition-transform duration-500 ease-out" /> Refresh
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.back()} 
                  className="group gap-2 h-9 text-xs font-semibold border-slate-200 bg-white text-slate-600 dark:text-slate-600 dark:bg-white dark:border-slate-200 hover:text-rose-600 dark:hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-500/15 active:scale-[0.96] transition-all duration-200 shadow-sm"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-500 group-hover:rotate-90 transition-transform duration-300 ease-out" /> Close
                </Button>
              </div>
            </div>

            {/* Layout Grid */}
              
              {/* Left Column: Metadata Details */}
              <Card className="border border-slate-100 shadow-lg rounded-2xl bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> Ticket Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Row 1: Status & Priority Highlight */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 hover:bg-slate-50/70 transition-all shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
                        <div className="mt-1.5 flex items-center">
                          <Badge variant={getStatusVariant(ticket.statusCode)} className="font-semibold px-2.5 py-1 text-xs">
                            {ticket.statusName || '—'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-500">
                        <Activity className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 hover:bg-slate-50/70 transition-all shadow-sm flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</div>
                        <div className="mt-1.5 flex items-center">
                          <Badge variant={getPriorityVariant(ticket.priorityCode)} className="font-semibold px-2.5 py-1 text-xs">
                            {ticket.priorityName || '—'}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-red-50 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Categorization */}
                  <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-5">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 bg-slate-50/40 rounded-xl p-3 border border-slate-50">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{ticket.categoryName || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subcategory</div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 bg-slate-50/40 rounded-xl p-3 border border-slate-50">
                        <Tag className="w-4 h-4 text-slate-400 opacity-60" />
                        <span className="truncate">{ticket.subCategoryName || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Source & SLA */}
                  <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-5">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Source</div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 bg-slate-50/40 rounded-xl p-3 border border-slate-50">
                        {ticket.sourceName?.toLowerCase().includes('email') ? (
                          <Mail className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Globe className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{ticket.sourceName || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SLA Plan</div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 bg-slate-50/40 rounded-xl p-3 border border-slate-50">
                        <Layers className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{ticket.slaName || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Requester & Assigned To */}
                  <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-5">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Requester</div>
                      <div className="flex items-center gap-3 bg-slate-50/40 rounded-xl p-3 border border-slate-50">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-mono text-xs font-bold text-blue-700 shadow-sm border border-blue-200/50">
                          {getInitials(ticket.requesterName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{ticket.requesterName || '—'}</p>
                          <p className="text-[10px] text-slate-400">Ticket Creator</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned To</div>
                      <div className="flex items-center gap-3 bg-slate-50/40 rounded-xl p-3 border border-slate-50">
                        {ticket.assignedUserName ? (
                          <>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-mono text-xs font-bold text-emerald-700 shadow-sm border border-emerald-200/50">
                              {getInitials(ticket.assignedUserName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{ticket.assignedUserName}</p>
                              <p className="text-[10px] text-slate-400">Assigned Agent</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 border border-slate-200">
                              ?
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-400 italic">Unassigned</p>
                              <p className="text-[10px] text-slate-400">No agent assigned</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 5: SLA Due Dates & Timestamps */}
                  <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-5">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/20 p-3.5 space-y-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Key Timestamps
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Created At</span>
                          <span className="font-medium text-slate-700">{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Updated At</span>
                          <span className="font-medium text-slate-700">{formatDate(ticket.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/20 p-3.5 space-y-3.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> SLA Deadlines
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">First Response Due</span>
                          <span className={`font-medium ${ticket.isFirstResponseBreached ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {formatDate(ticket.firstResponseDueAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Resolution Due</span>
                          <span className={`font-medium ${ticket.isResolutionBreached ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {formatDate(ticket.resolutionDueAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Actions */}
              <div className="space-y-4">
                <Card className="border border-slate-100 shadow-lg rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" /> Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button
                      variant={showEditPanel ? "primary" : "outline"}
                      onClick={() => setShowEditPanel(prev => !prev)}
                      className={`group w-full justify-start gap-3 h-10 px-4 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] ${
                        showEditPanel 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 dark:text-slate-600 dark:bg-white dark:border-slate-200 hover:text-[#1E40AF] dark:hover:text-[#1E40AF] hover:border-[#1E40AF]/40 dark:hover:border-[#1E40AF]/40 hover:bg-[#EFF6FF]/60 dark:hover:bg-[#EFF6FF]/60 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/15'
                      }`}
                    >
                      <Edit className={`w-4 h-4 transition-transform duration-200 ${showEditPanel ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-[#1E40AF] group-hover:rotate-12 group-hover:translate-x-0.5'}`} />
                      <span>{showEditPanel ? 'Hide Edit Ticket' : 'Edit Ticket'}</span>
                    </Button>

                    <Button
                      onClick={() => setShowStatusPanel(prev => !prev)}
                      variant={showStatusPanel ? "primary" : "outline"}
                      className={`group w-full justify-start gap-3 h-10 px-4 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] ${
                        showStatusPanel 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 dark:text-slate-600 dark:bg-white dark:border-slate-200 hover:text-[#1E40AF] dark:hover:text-[#1E40AF] hover:border-[#1E40AF]/40 dark:hover:border-[#1E40AF]/40 hover:bg-[#EFF6FF]/60 dark:hover:bg-[#EFF6FF]/60 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/15'
                      }`}
                    >
                      <Activity className={`w-4 h-4 transition-transform duration-200 ${showStatusPanel ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-[#1E40AF] group-hover:scale-110'}`} />
                      <span>{showStatusPanel ? 'Hide Change Status' : 'Change Status'}</span>
                    </Button>

                    <Button
                      onClick={() => setShowAssignPanel(prev => !prev)}
                      variant={showAssignPanel ? "primary" : "outline"}
                      className={`group w-full justify-start gap-3 h-10 px-4 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] ${
                        showAssignPanel 
                          ? 'bg-primary text-white border-primary shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 dark:text-slate-600 dark:bg-white dark:border-slate-200 hover:text-[#1E40AF] dark:hover:text-[#1E40AF] hover:border-[#1E40AF]/40 dark:hover:border-[#1E40AF]/40 hover:bg-[#EFF6FF]/60 dark:hover:bg-[#EFF6FF]/60 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/15'
                      }`}
                    >
                      <UserCheck className={`w-4 h-4 transition-transform duration-200 ${showAssignPanel ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-[#1E40AF] group-hover:-translate-y-0.5'}`} />
                      <span>{showAssignPanel ? 'Hide Assign Ticket' : 'Assign Ticket'}</span>
                    </Button>
                  </CardContent>
                </Card>

                {/* Sub Panels */}
                {showEditPanel && (
                  <Card className="border border-slate-100 shadow-md rounded-2xl bg-white overflow-hidden transition-all">
                    <CardHeader className="pb-3 bg-slate-50/30 border-b border-slate-100">
                      <CardTitle className="text-xs font-bold text-slate-800">Edit Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Title</label>
                        <Input placeholder="Enter new title" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="rounded-xl h-9 text-xs" />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Description</label>
                        <textarea
                          placeholder="Enter new description"
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                          rows={4}
                          className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Category</label>
                          <Select
                            value={editCategory}
                            onChange={value => {
                              setEditCategory(value);
                              if (value !== editCategory) setEditSubCategory('');
                            }}
                            options={categories.map(c => ({ value: c.id, label: c.name }))}
                            placeholder="Select Category"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Subcategory</label>
                          <Select
                            value={editSubCategory}
                            onChange={setEditSubCategory}
                            options={filteredEditSubCategories.map((s: any) => ({ value: s.id, label: s.name }))}
                            placeholder="Select Subcategory"
                            disabled={!editCategory}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Priority</label>
                          <Select
                            value={editPriority}
                            onChange={setEditPriority}
                            options={priorities.map(p => ({ value: p.id, label: p.name }))}
                            placeholder="Select Priority"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Source</label>
                          <Select
                            value={editSource}
                            onChange={setEditSource}
                            options={sources.map(s => ({ value: s.id, label: s.name }))}
                            placeholder="Select Source"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">SLA Plan</label>
                        <Select
                          value={editSla}
                          onChange={setEditSla}
                          options={slas.map(s => ({ value: s.id, label: s.name }))}
                          placeholder="Select SLA Plan"
                        />
                      </div>

                      <Button onClick={handleUpdateTicket} disabled={editSubmitting} className="w-full gap-2 rounded-xl h-9 text-xs font-semibold shadow-sm mt-2">
                        {editSubmitting ? 'Updating...' : 'Save Changes'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {showStatusPanel && (
                  <Card className="border border-slate-100 shadow-md rounded-2xl bg-white overflow-hidden transition-all">
                    <CardHeader className="pb-3 bg-slate-50/30 border-b border-slate-100">
                      <CardTitle className="text-xs font-bold text-slate-800">Change Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">New Status</label>
                        <Select
                          value={selectedStatus}
                          onChange={setSelectedStatus}
                          options={statuses.map(s => ({ value: s.id, label: s.name }))}
                          placeholder="Select Status"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Update Reason</label>
                        <Input
                          placeholder="Why is status changing? (optional)"
                          value={statusReason}
                          onChange={e => setStatusReason(e.target.value)}
                          className="rounded-xl h-9 text-xs"
                        />
                      </div>
                      <Button onClick={handleStatusChange} disabled={statusSubmitting} className="w-full gap-2 rounded-xl h-9 text-xs font-semibold shadow-sm mt-2">
                        {statusSubmitting ? 'Updating...' : 'Update Status'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {showAssignPanel && (
                  <Card className="border border-slate-100 shadow-md rounded-2xl bg-white overflow-hidden transition-all">
                    <CardHeader className="pb-3 bg-slate-50/30 border-b border-slate-100">
                      <CardTitle className="text-xs font-bold text-slate-800">Assign Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Select Agent</label>
                        <Select
                          value={selectedUser}
                          onChange={setSelectedUser}
                          options={[{ value: '', label: 'Unassign Ticket' }, ...users.map(u => ({ value: u.id, label: u.name }))]}
                          placeholder="Select Agent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Assignment Reason</label>
                        <Input
                          placeholder="Reason for reassignment? (optional)"
                          value={assignReason}
                          onChange={e => setAssignReason(e.target.value)}
                          className="rounded-xl h-9 text-xs"
                        />
                      </div>
                      <Button onClick={handleAssign} disabled={assignSubmitting} className="w-full gap-2 rounded-xl h-9 text-xs font-semibold shadow-sm mt-2">
                        {assignSubmitting ? 'Assigning...' : 'Assign Agent'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

            {/* Description & Timeline History */}
              {/* Description */}
              <Card className="border border-slate-100 shadow-lg rounded-2xl bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" /> Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description || 'No description provided.'}</p>
                </CardContent>
              </Card>

              {/* History */}
              <Card className="border border-slate-100 shadow-lg rounded-2xl bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <HistoryIcon className="w-4 h-4 text-primary" /> Timeline History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {timeline.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No timeline logs available.</p>
                  ) : (
                    <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      {timeline.map((item, index) => {
                        const eventTypeRaw = item.eventType || item.event || item.action || item.type || 'Update';
                        const eventType = String(eventTypeRaw).toLowerCase();
                        let iconBg = 'bg-slate-100 text-slate-500';
                        if (eventType.includes('status') || eventType.includes('state')) iconBg = 'bg-blue-50 text-blue-600 border border-blue-200/50';
                        if (eventType.includes('assign')) iconBg = 'bg-emerald-50 text-emerald-600 border border-emerald-200/50';
                        if (eventType.includes('create')) iconBg = 'bg-indigo-50 text-indigo-600 border border-indigo-200/50';
                        if (eventType.includes('comment')) iconBg = 'bg-amber-50 text-amber-600 border border-amber-200/50';
                        if (eventType.includes('update')) iconBg = 'bg-slate-100 text-slate-700 border border-slate-300/50';

                        const title = item.title || String(eventTypeRaw).replace(/_/g, ' ');
                        const timestamp = formatDate(item.occurredAt || item.timestamp || item.createdAt || item.date);
                        const description = item.description || item.details || item.message || item.body || 'No description available.';
                        const actor = item.actorName || item.authorName || item.userName || item.user;

                        return (
                          <div key={item.id || index} className="relative group">
                            {/* Dot indicator */}
                            <div className={`absolute -left-[22px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full ring-4 ring-white ${iconBg} text-[9px] font-black`}>
                              •
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  {title}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {timestamp}
                                </span>
                              </div>
                              {actor && (
                                <span className="text-[10px] text-slate-500">By {actor}{item.isInternal ? ' (internal)' : ''}</span>
                              )}
                              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                {description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* Comments Card */}
            <Card className="border border-slate-100 shadow-lg rounded-2xl bg-white overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" /> Comments & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {(ticket.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50/20 border border-dashed border-slate-200 rounded-xl">No comments yet.</p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    {ticket.comments.map(comment => (
                      <div
                        key={comment.id}
                        className={`relative flex gap-4 p-4 rounded-xl border transition-all ${
                          comment.isInternal
                            ? 'bg-amber-500/[0.02] border-amber-200/60 shadow-sm'
                            : 'bg-slate-50/40 border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 font-mono text-xs font-bold text-slate-700 shadow-sm border border-slate-300/40">
                          {getInitials(comment.authorName)}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{comment.authorName || 'Unknown'}</span>
                            <div className="flex items-center gap-2">
                              {comment.isInternal && (
                                <Badge variant="warning" className="text-[9px] font-semibold tracking-wider px-1.5 py-0">
                                  Internal Note
                                </Badge>
                              )}
                              <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-5 border-t border-slate-100 space-y-3.5">
                  <textarea
                    placeholder="Write a public comment or internal note..."
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    rows={3}
                    className="flex min-h-[90px] w-full rounded-xl border border-slate-200 bg-background px-3 py-2 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all shadow-inner"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={e => setIsInternal(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="flex items-center gap-1">
                        Internal Note <span className="text-[10px] text-slate-400 font-normal">(only visible to agents)</span>
                      </span>
                    </label>
                    <Button onClick={handleAddComment} disabled={commentSubmitting} className="gap-2 rounded-xl h-9 text-xs font-semibold shadow-sm px-4">
                      <Send className="w-3.5 h-3.5" />
                      {commentSubmitting ? 'Sending...' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </motion.div>
    </div>
  );
}
