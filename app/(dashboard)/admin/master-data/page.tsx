"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  Tag, 
  Subtitles, 
  AlertTriangle, 
  Activity, 
  Mail, 
  Calendar, 
  Building, 
  Settings, 
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  Square,
  MoreVertical,
  ArrowLeft,
  Server,
  Shield,
  Inbox,
  Zap,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { MasterDataExpandedDetails } from './master-data-expanded-details';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client-api';

interface MasterDataItem {
  id: string;
  name: string;
  description: string;
  color?: string;
  level?: number;
  date?: string;
  isActive: boolean;
  categoryId?: string;
  categoryName?: string;
  code?: string;
  departmentId?: string;
  subCategories?: any[];
  masterTypeId?: string;
}

// ─── SLA Types ────────────────────────────────────────────────────────────────
interface SlaItem {
  id: string;
  name: string;
  departmentId?: string | null;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  businessHoursOnly: boolean;
  isActive: boolean;
}

const EMPTY_SLA: Omit<SlaItem, 'id'> = {
  name: '',
  departmentId: null,
  responseTimeMinutes: 60,
  resolutionTimeMinutes: 480,
  businessHoursOnly: false,
  isActive: true,
};

// ─── Email Types ──────────────────────────────────────────────────────────────
interface EmailItem {
  id: string;
  name: string;
  smtpHost: string;
  port: number;
  userName: string;
  password: string;
  fromEmail: string;
  fromName: string;
  enableSsl: boolean;
  imapHost: string;
  imapPort: number;
  imapEnableSsl: boolean;
  inboundMailboxFolder: string;
  enableIncidentIngestion: boolean;
  isActive: boolean;
}

const EMPTY_EMAIL: Omit<EmailItem, 'id'> = {
  name: '',
  smtpHost: '',
  port: 587,
  userName: '',
  password: '',
  fromEmail: '',
  fromName: '',
  enableSsl: true,
  imapHost: '',
  imapPort: 993,
  imapEnableSsl: true,
  inboundMailboxFolder: 'INBOX',
  enableIncidentIngestion: false,
  isActive: true,
};

// ─── Validators ───────────────────────────────────────────────────────────────
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPort = (port: number) => Number.isInteger(port) && port >= 1 && port <= 65535;

// UI Metadata for known master types
const STATIC_TABS = [
  { id: 'category', label: 'Category', icon: Tag, description: 'Manage ticket categories and classifications', code: 'CATEGORY' },
  { id: 'subcategory', label: 'Subcategory', icon: Subtitles, description: 'Manage nested subcategories for tickets', code: 'SUBCATEGORY' },
  { id: 'priority', label: 'Priority', icon: AlertTriangle, description: 'Define SLA priorities and response times', code: 'PRIORITY' },
  { id: 'severity', label: 'Severity', icon: Activity, description: 'Manage incident severities and impact levels', code: 'SEVERITY' },
  { id: 'source', label: 'Source', icon: Mail, description: 'Configure ticket origin channels', code: 'SOURCE' },
  { id: 'holiday', label: 'Holiday', icon: Calendar, description: 'Manage organizational holidays for SLA calculations', code: 'HOLIDAY' },
  { id: 'department', label: 'Department', icon: Building, description: 'Manage company departments and groups', code: 'DEPARTMENT' },
  { id: 'email', label: 'Email Config', icon: Settings, description: 'Configure IMAP/SMTP settings for email integration', code: 'EMAIL_CONFIG' },
  { id: 'sla', label: 'SLA Config', icon: Clock, description: 'Configure Service Level Agreements and rules', code: 'SLA_CONFIG' },
  { id: 'roles', label: 'Roles', icon: Shield, description: 'Manage user roles and permissions', code: 'ROLES' },
];

const MASTER_TYPE_UI: Record<string, { icon: any, description: string }> = {
  'CATEGORY': { icon: Tag, description: 'Manage ticket categories and classifications' },
  'SUBCATEGORY': { icon: Subtitles, description: 'Manage nested subcategories for tickets' },
  'PRIORITY': { icon: AlertTriangle, description: 'Define SLA priorities and response times' },
  'SEVERITY': { icon: Activity, description: 'Manage incident severities and impact levels' },
  'SOURCE': { icon: Mail, description: 'Configure ticket origin channels' },
  'HOLIDAY': { icon: Calendar, description: 'Manage organizational holidays for SLA calculations' },
  'DEPARTMENT': { icon: Building, description: 'Manage company departments and groups' },
  'EMAIL_CONFIG': { icon: Settings, description: 'Configure IMAP/SMTP settings for email integration' },
  'SLA_CONFIG': { icon: Clock, description: 'Configure Service Level Agreements and rules' },
  'ROLES': { icon: Shield, description: 'Manage user roles and permissions' },
};

export default function MasterDataPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isExpanded, setIsExpanded] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  // States
  const [masterTypes, setMasterTypes] = useState<any[]>([]);
  const [masterItems, setMasterItems] = useState<MasterDataItem[]>([]);
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [categories, setCategories] = useState<MasterDataItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showMasterTypeModal, setShowMasterTypeModal] = useState(false);
  const [editingMasterType, setEditingMasterType] = useState<any>(null);

  // ─── SLA State ────────────────────────────────────────────────────
  const [slaItems, setSlaItems] = useState<SlaItem[]>([]);
  const [slaLoading, setSlaLoading] = useState(false);
  const [showSlaModal, setShowSlaModal] = useState(false);
  const [editingSla, setEditingSla] = useState<SlaItem | null>(null);
  const [slaForm, setSlaForm] = useState<Omit<SlaItem, 'id'>>(EMPTY_SLA);
  const [slaSubmitting, setSlaSubmitting] = useState(false);

  // ─── Email State ──────────────────────────────────────────────────
  const [emailItems, setEmailItems] = useState<EmailItem[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailItem | null>(null);
  const [emailForm, setEmailForm] = useState<Omit<EmailItem, 'id'>>(EMPTY_EMAIL);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // ─── SLA API Calls ────────────────────────────────────────────────

  const fetchSlas = async () => {
    setSlaLoading(true);
    try {
      const result = await apiGet<SlaItem[]>('/api/sla-configurations?PageSize=50');
      if (result.success && result.data) {
        setSlaItems(result.data);
      } else {
        toast(result.error || 'Failed to load SLA configurations', 'error');
      }
    } catch {
      toast('Failed to load SLA configurations', 'error');
    } finally {
      setSlaLoading(false);
    }
  };

  const handleSlaSubmit = async () => {
    // Validate
    if (!slaForm.name.trim()) return toast('Name required hai', 'error');
    if (!slaForm.responseTimeMinutes || Number(slaForm.responseTimeMinutes) < 1) 
      return toast('Response time 1 minute se zyada hona chahiye', 'error');
    if (!slaForm.resolutionTimeMinutes || Number(slaForm.resolutionTimeMinutes) < 1) 
      return toast('Resolution time 1 minute se zyada hona chahiye', 'error');

    const payload = {
      name: slaForm.name.trim(),
      departmentId: null,
      responseTimeMinutes: Number(slaForm.responseTimeMinutes),
      resolutionTimeMinutes: Number(slaForm.resolutionTimeMinutes),
      businessHoursOnly: slaForm.businessHoursOnly,
      isActive: slaForm.isActive,
      isGlobal: true
    };

    setSlaSubmitting(true);
    try {
      const isNew = !editingSla;
      const url = isNew ? '/api/sla-configurations' : `/api/sla-configurations/${editingSla!.id}`;
      const result = isNew ? await apiPost(url, payload) : await apiPut(url, payload);
      if (result.success) {
        toast(isNew ? 'SLA created successfully!' : 'SLA updated successfully!', 'success');
        setShowSlaModal(false);
        fetchSlas();
      } else {
        toast(result.error || 'Failed to save SLA', 'error');
      }
    } catch {
      toast('Failed to save SLA', 'error');
    } finally {
      setSlaSubmitting(false);
    }
  };

  const handleSlaDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this SLA?')) return;
    try {
      const result = await apiDelete(`/api/sla-configurations/${id}`);
      if (result.success) {
        toast('SLA deleted successfully!', 'success');
        fetchSlas();
      } else {
        toast(result.error || 'Failed to delete SLA', 'error');
      }
    } catch {
      toast('Failed to delete SLA', 'error');
    }
  };

  const openSlaCreate = () => {
    setEditingSla(null);
    setSlaForm(EMPTY_SLA);
    setShowSlaModal(true);
  };

  const openSlaEdit = (sla: SlaItem) => {
    setEditingSla(sla);
    setSlaForm({
      name: sla.name,
      departmentId: sla.departmentId,
      responseTimeMinutes: sla.responseTimeMinutes,
      resolutionTimeMinutes: sla.resolutionTimeMinutes,
      businessHoursOnly: sla.businessHoursOnly,
      isActive: sla.isActive,
    });
    setShowSlaModal(true);
  };

  // ─── Roles State ──────────────────────────────────────────────────
const [roleItems, setRoleItems] = useState<{id: string, name: string}[]>([]);
const [roleLoading, setRoleLoading] = useState(false);
const [showRoleModal, setShowRoleModal] = useState(false);
const [editingRole, setEditingRole] = useState<{id: string, name: string} | null>(null);
const [roleName, setRoleName] = useState('');
const [roleSubmitting, setRoleSubmitting] = useState(false);

const fetchRoles = async () => {
  setRoleLoading(true);
  try {
    const result = await apiGet<{id: string, name: string}[]>('/api/roles');
    if (result.success && result.data) setRoleItems(result.data);
    else toast(result.error || 'Failed to load roles', 'error');
  } catch {
    toast('Failed to load roles', 'error');
  } finally {
    setRoleLoading(false);
  }
};

const handleRoleSubmit = async () => {
  if (!roleName.trim()) return toast('Name required hai', 'error');
  setRoleSubmitting(true);
  try {
    const isNew = !editingRole;
    const url = isNew ? '/api/roles' : `/api/roles/${editingRole!.id}`;
    const result = isNew ? await apiPost(url, { name: roleName }) : await apiPut(url, { name: roleName });
    if (result.success) {
      toast(isNew ? 'Role created!' : 'Role updated!', 'success');
      setShowRoleModal(false);
      fetchRoles();
    } else {
      toast(result.error || 'Failed to save role', 'error');
    }
  } catch {
    toast('Failed to save role', 'error');
  } finally {
    setRoleSubmitting(false);
  }
};

const handleRoleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this role?')) return;
  try {
    const result = await apiDelete(`/api/roles/${id}`);
    if (result.success) {
      toast('Role deleted!', 'success');
      fetchRoles();
    } else {
      toast(result.error || 'Failed to delete role', 'error');
    }
  } catch {
    toast('Failed to delete role', 'error');
  }
};

  // ─── Email API Calls ──────────────────────────────────────────────

  const fetchEmails = async () => {
    setEmailLoading(true);
    try {
      const result = await apiGet<EmailItem[]>('/api/email-configurations?PageSize=50');
      if (result.success && result.data) {
        setEmailItems(result.data);
      } else {
        toast(result.error || 'Failed to load email configurations', 'error');
      }
    } catch {
      toast('Failed to load email configurations', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    // Validate
    if (!emailForm.name.trim()) return toast('Name required hai', 'error');
    if (!emailForm.smtpHost.trim()) return toast('SMTP Host required hai', 'error');
    if (!isValidPort(Number(emailForm.port))) return toast('SMTP Port 1-65535 ke beech hona chahiye', 'error');
    if (!isValidEmail(emailForm.fromEmail)) return toast('Valid From Email address daalo', 'error');
    if (emailForm.imapHost && !isValidPort(Number(emailForm.imapPort))) return toast('IMAP Port 1-65535 ke beech hona chahiye', 'error');

    const payload = {
      ...emailForm,
      port: Number(emailForm.port),
      imapPort: Number(emailForm.imapPort),
    };

    setEmailSubmitting(true);
    try {
      const isNew = !editingEmail;
      const url = isNew ? '/api/email-configurations' : `/api/email-configurations/${editingEmail!.id}`;
      const result = isNew ? await apiPost(url, payload) : await apiPut(url, payload);
      if (result.success) {
        toast(isNew ? 'Email config created!' : 'Email config updated!', 'success');
        setShowEmailModal(false);
        fetchEmails();
      } else {
        toast(result.error || 'Failed to save email config', 'error');
      }
    } catch {
      toast('Failed to save email config', 'error');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleEmailDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email configuration?')) return;
    try {
      const result = await apiDelete(`/api/email-configurations/${id}`);
      if (result.success) {
        toast('Email config deleted!', 'success');
        fetchEmails();
      } else {
        toast(result.error || 'Failed to delete email config', 'error');
      }
    } catch {
      toast('Failed to delete email config', 'error');
    }
  };

  const openEmailCreate = () => {
    setEditingEmail(null);
    setEmailForm(EMPTY_EMAIL);
    setShowPassword(false);
    setShowEmailModal(true);
  };

  const openEmailEdit = (email: EmailItem) => {
    setEditingEmail(email);
    setEmailForm({
      name: email.name,
      smtpHost: email.smtpHost,
      port: email.port,
      userName: email.userName,
      password: email.password,
      fromEmail: email.fromEmail,
      fromName: email.fromName,
      enableSsl: email.enableSsl,
      imapHost: email.imapHost,
      imapPort: email.imapPort,
      imapEnableSsl: email.imapEnableSsl,
      inboundMailboxFolder: email.inboundMailboxFolder,
      enableIncidentIngestion: email.enableIncidentIngestion,
      isActive: email.isActive,
    });
    setShowPassword(false);
    setShowEmailModal(true);
  };

  // ─── Fetch on tab change ──────────────────────────────────────────

  useEffect(() => {
    if (!activeTab) return;
    const activeTabData = allTabs.find(t => t.id === activeTab);
    const code = activeTabData?.code;
    if (code === 'SLA_CONFIG') fetchSlas();
else if (code === 'EMAIL_CONFIG') fetchEmails();
else if (code === 'ROLES') fetchRoles();
  }, [activeTab]);

  // ─── Fetch Functions ───────────────────────────────────────────────────────

  const fetchMasterTypes = async () => {
    try {
      setIsLoading(true);
      const result = await apiGet<any[]>('/api/mastertypes');
      if (result.success && result.data) {
        setMasterTypes(result.data || []);
      }
    } catch (error) {
      toast('Failed to load master types', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterDataByTypeId = async (typeId: string) => {
    try {
      setIsLoading(true);
      const activeTabData = allTabs.find(t => t.id === typeId);
      const code = activeTabData?.code;

      let endpoint = `/api/masterdata?masterTypeId=${typeId}`;
      if (code === 'DEPARTMENT') endpoint = '/api/departments';
      else if (code === 'CATEGORY') endpoint = '/api/categories';
      else if (code === 'SUBCATEGORY') endpoint = '/api/subcategories';
      else if (code === 'HOLIDAY') endpoint = '/api/holidays';

      const result = await apiGet<any[]>(endpoint);
      if (result.success && result.data) {
        setMasterItems(
          (result.data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            code: item.code,
            level: item.sortOrder || item.level || 0,
            isActive: item.isActive,
            masterTypeId: item.masterTypeId || typeId,
            departmentId: item.departmentId,
            categoryId: item.categoryId,
            date: item.date
          }))
        );
      }
    } catch (error) {
      toast('Failed to load items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const result = await apiGet<MasterDataItem[]>('/api/departments');
      if (result.success && result.data) setDepartments(result.data || []);
    } catch (error) {}
  };

  const fetchCategories = async () => {
    try {
      const result = await apiGet<MasterDataItem[]>('/api/categories');
      if (result.success && result.data) setCategories(result.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchMasterTypes();
    fetchDepartments();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab) {
      const activeTabData = allTabs.find(t => t.id === activeTab);
      const code = activeTabData?.code;
      // Only fetch masterdata for non-special tabs
      if (code !== 'SLA_CONFIG' && code !== 'EMAIL_CONFIG') {
        fetchMasterDataByTypeId(activeTab);
      }
    }
  }, [activeTab]);

  // ─── Tabs ─────────────────────────────────────────────────────────

  const allTabs = useMemo(() => {
    const tabsMap = new Map();
    
    STATIC_TABS.forEach(tab => {
      const mt = masterTypes.find(m => 
        m.code === tab.code || 
        m.name?.toLowerCase() === tab.label?.toLowerCase()
      );
      tabsMap.set(tab.code, {
        ...tab,
        id: mt ? mt.id : tab.id,
        isStatic: true
      });
    });
  
    masterTypes.forEach(mt => {
      const alreadyMapped = Array.from(tabsMap.values()).some(t => t.id === mt.id);
      if (!alreadyMapped && !tabsMap.has(mt.code)) {
        const ui = MASTER_TYPE_UI[mt.code] || { icon: Database, description: `Manage ${mt.name} data items` };
        tabsMap.set(mt.code, {
          id: mt.id,
          label: mt.name,
          icon: ui.icon,
          description: mt.description || ui.description,
          code: mt.code,
          isDynamic: true
        });
      }
    });
  
    return Array.from(tabsMap.values());
  }, [masterTypes]);

  // ─── Data Helpers ─────────────────────────────────────────────────

  const getData = (): MasterDataItem[] => masterItems;
  const setData = (data: MasterDataItem[]) => setMasterItems(data);

  const getFilteredData = () => {
    const data = getData();
    let filtered = data.filter(item => {
      const matchesSearch =
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesActive = showInactive || item.isActive !== false;
      return matchesSearch && matchesActive;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      if (sortBy === 'level') { aValue = a.level || 0; bValue = b.level || 0; }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  };

  // ─── Selection ────────────────────────────────────────────────────

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = () => {
    const filteredData = getFilteredData();
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  const toggleExpanded = (id: string) => {
    setIsExpanded(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const bulkDelete = () => {
    if (selectedItems.length === 0) { toast('No items selected', 'error'); return; }
    const data = getData();
    setData(data.filter(item => !selectedItems.includes(item.id)));
    toast(`Deleted ${selectedItems.length} items successfully`, 'success');
    setSelectedItems([]);
  };

  const bulkToggleActive = () => {
    if (selectedItems.length === 0) { toast('No items selected', 'error'); return; }
    const data = getData();
    setData(data.map(item =>
      selectedItems.includes(item.id) ? { ...item, isActive: !item.isActive } : item
    ));
    toast(`Updated ${selectedItems.length} items successfully`, 'success');
    setSelectedItems([]);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────

  const handleAdd = () => {
    const activeTabData = allTabs.find(t => t.id === activeTab);
    const code = activeTabData?.code;

    const newItem: MasterDataItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      color: code === 'PRIORITY' ? '#FF4444' : undefined,
      level: (code === 'PRIORITY' || code === 'SEVERITY') ? 1 : undefined,
      date: code === 'HOLIDAY' ? new Date().toISOString().split('T')[0] : undefined,
      categoryId: undefined,
      categoryName: undefined,
      code: '',
      departmentId: undefined,
      isActive: true,
      masterTypeId: activeTab as string
    };
    setEditingItem(newItem);
    setShowModal(true);
  };

  const handleEdit = (item: MasterDataItem) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingItem?.name.trim()) {
      toast('Name is required', 'error');
      return;
    }

    try {
      const activeTabData = allTabs.find(t => t.id === activeTab);
      const code = activeTabData?.code;
      const isNew = !masterItems.find(item => item.id === editingItem.id);

      let body: any = { ...editingItem };
      
      if (!['CATEGORY', 'SUBCATEGORY', 'HOLIDAY', 'DEPARTMENT'].includes(code || '')) {
        body = {
          masterTypeId: activeTab,
          departmentId: editingItem.departmentId || (departments.length > 0 ? departments[0].id : undefined),
          name: editingItem.name,
          code: editingItem.code || editingItem.name?.toUpperCase().replace(/\s+/g, '_'),
          sortOrder: editingItem.level || 0,
          isActive: editingItem.isActive
        };
      }

      let result;
      if (code === 'DEPARTMENT') {
        const url = isNew ? '/api/departments' : `/api/departments/${editingItem.id}`;
        result = isNew ? await apiPost(url, body) : await apiPut(url, body);
      } else if (code === 'CATEGORY') {
        const url = isNew ? '/api/categories' : `/api/categories/${editingItem.id}`;
        result = isNew ? await apiPost(url, body) : await apiPut(url, body);
      } else if (code === 'SUBCATEGORY') {
        const url = isNew ? '/api/subcategories' : `/api/subcategories/${editingItem.id}`;
        result = isNew ? await apiPost(url, body) : await apiPut(url, body);
      } else if (code === 'HOLIDAY') {
        const url = isNew ? '/api/holidays' : `/api/holidays/${editingItem.id}`;
        result = isNew ? await apiPost(url, body) : await apiPut(url, body);
      } else {
        const url = isNew ? '/api/masterdata' : `/api/masterdata/${editingItem.id}`;
        result = isNew ? await apiPost(url, body) : await apiPut(url, body);
      }

      if (result && result.success) {
        toast(isNew ? 'Item created successfully' : 'Item updated successfully', 'success');
        setShowModal(false); 
        setEditingItem(null);
        await fetchMasterDataByTypeId(activeTab as string);
        if (code === 'DEPARTMENT') fetchDepartments();
        if (code === 'CATEGORY') fetchCategories();
      } else {
        toast(result?.error || 'Failed to save item', 'error');
      }
    } catch (error) {
      toast('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const activeTabData = allTabs.find(t => t.id === activeTab);
      const code = activeTabData?.code;

      let endpoint = `/api/masterdata/${id}`;
      if (code === 'DEPARTMENT') endpoint = `/api/departments/${id}`;
      else if (code === 'CATEGORY') endpoint = `/api/categories/${id}`;
      else if (code === 'SUBCATEGORY') endpoint = `/api/subcategories/${id}`;
      else if (code === 'HOLIDAY') endpoint = `/api/holidays/${id}`;

      const result = await apiDelete(endpoint);
      
      if (result.success) {
        toast('Item deleted successfully', 'success');
        await fetchMasterDataByTypeId(activeTab as string);
        if (code === 'DEPARTMENT') fetchDepartments();
        if (code === 'CATEGORY') fetchCategories();
      } else {
        toast(result.error || 'Failed to delete item', 'error');
      }
    } catch (error) {
      toast('Failed to delete item', 'error');
    }
  };

  const handleSaveMasterType = async () => {
    if (!editingMasterType?.name?.trim()) {
      toast('Name is required', 'error');
      return;
    }

    try {
      const isNew = !masterTypes.find(mt => mt.id === editingMasterType.id);
      const url = isNew ? '/api/mastertypes' : `/api/mastertypes/${editingMasterType.id}`;
      const body = {
        name: editingMasterType.name,
        code: editingMasterType.code || editingMasterType.name?.toUpperCase().replace(/\s+/g, '_'),
        isActive: true
      };
      const result = isNew ? await apiPost(url, body) : await apiPut(url, body);

      if (result.success) {
        toast(isNew ? 'Master Type created successfully' : 'Master Type updated successfully', 'success');
        setShowMasterTypeModal(false);
        setEditingMasterType(null);
        await fetchMasterTypes();
      } else {
        toast(result.error || 'Failed to save master type', 'error');
      }
    } catch (error) {
      toast('Failed to save master type', 'error');
    }
  };

  const handleDeleteMasterType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Master Type? All associated data will be lost.')) return;

    try {
      const result = await apiDelete(`/api/mastertypes/${id}`);

      if (result.success) {
        toast('Master Type deleted successfully', 'success');
        await fetchMasterTypes();
      } else {
        toast(result.error || 'Failed to delete master type', 'error');
      }
    } catch (error) {
      toast('Failed to delete master type', 'error');
    }
  };

  const toggleActive = (id: string) => {
    const data = getData();
    setData(data.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  // roles RENDER
  const renderRolesContent = () => (
  <div className="space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <h2 className="text-2xl font-bold">Roles</h2>
      <Button onClick={() => { setEditingRole(null); setRoleName(''); setShowRoleModal(true); }} className="gap-2">
        <Plus className="w-4 h-4" /> Add Role
      </Button>
    </div>

    {roleLoading ? (
      <Card><CardContent className="py-16 text-center text-muted-foreground">Loading...</CardContent></Card>
    ) : roleItems.length === 0 ? (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          <Shield className="w-14 h-14 mx-auto mb-4 opacity-40" />
          <p className="font-medium">No roles found</p>
          <p className="text-sm mt-1">Create your first role to get started</p>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  {['Name', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roleItems.map(role => (
                  <tr key={role.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium">{role.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingRole(role); setRoleName(role.name); setShowRoleModal(true); }} className="p-1">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRoleDelete(role.id)} className="p-1 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )}

    {showRoleModal && (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Create Role'}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowRoleModal(false)} className="rounded-full w-8 h-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-6 space-y-4">
            <Input
              label="Role Name *"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
              placeholder="e.g. Support Agent"
            />
            <div className="flex gap-2 pt-2">
              <Button onClick={handleRoleSubmit} disabled={roleSubmitting} className="gap-2">
                <Save className="w-4 h-4" />
                {roleSubmitting ? 'Saving...' : editingRole ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

  // ─── SLA Render ───────────────────────────────────────────────────
  const renderSlaContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold">SLA Configurations</h2>
        <Button onClick={openSlaCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add SLA
        </Button>
      </div>

      {slaLoading ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : slaItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Clock className="w-14 h-14 mx-auto mb-4 opacity-40" />
            <p className="font-medium">No SLA configurations found</p>
            <p className="text-sm mt-1">Create your first SLA to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Name', 'Response Time', 'Resolution Time', 'Business Hours Only', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slaItems.map(sla => (
                    <tr key={sla.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium">{sla.name}</td>
                      <td className="px-5 py-3">{sla.responseTimeMinutes} min</td>
                      <td className="px-5 py-3">{sla.resolutionTimeMinutes} min</td>
                      <td className="px-5 py-3">
                        <Badge variant={sla.businessHoursOnly ? 'default' : 'secondary'}>
                          {sla.businessHoursOnly ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={sla.isActive ? 'default' : 'secondary'}>
                          {sla.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openSlaEdit(sla)} className="p-1">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleSlaDelete(sla.id)} className="p-1 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SLA Modal */}
      {showSlaModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingSla ? 'Edit SLA' : 'Create SLA'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSlaModal(false)} className="rounded-full w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Name *"
                value={slaForm.name}
                onChange={e => setSlaForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. High Priority SLA"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Response Time (min) *"
                  type="number"
                  min={1}
                  value={String(slaForm.responseTimeMinutes)}
                  onChange={e => setSlaForm(f => ({ ...f, responseTimeMinutes: Number(e.target.value) }))}
                  placeholder="e.g. 60"
                />
                <Input
                  label="Resolution Time (min) *"
                  type="number"
                  min={1}
                  value={String(slaForm.resolutionTimeMinutes)}
                  onChange={e => setSlaForm(f => ({ ...f, resolutionTimeMinutes: Number(e.target.value) }))}
                  placeholder="e.g. 480"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={slaForm.businessHoursOnly}
                    onChange={e => setSlaForm(f => ({ ...f, businessHoursOnly: e.target.checked }))}
                    className="rounded"
                  />
                  Business Hours Only
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={slaForm.isActive}
                    onChange={e => setSlaForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="rounded"
                  />
                  Is Active
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSlaSubmit} disabled={slaSubmitting} className="gap-2">
                  <Save className="w-4 h-4" />
                  {slaSubmitting ? 'Saving...' : editingSla ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setShowSlaModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Email Render ─────────────────────────────────────────────────
  const renderEmailContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h2 className="text-2xl font-bold">Email Configurations</h2>
        <Button onClick={openEmailCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Email Config
        </Button>
      </div>

      {emailLoading ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : emailItems.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Mail className="w-14 h-14 mx-auto mb-4 opacity-40" />
            <p className="font-medium">No email configurations found</p>
            <p className="text-sm mt-1">Add your first email configuration to enable email integration</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emailItems.map(email => (
            <Card key={email.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">{email.name}</h3>
                        <Badge variant={email.isActive ? 'default' : 'secondary'}>
                          {email.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {email.enableIncidentIngestion && (
                          <Badge variant="outline" className="text-xs">Incident Ingestion</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span><span className="font-medium text-foreground">SMTP:</span> {email.smtpHost}:{email.port}</span>
                        <span><span className="font-medium text-foreground">From:</span> {email.fromEmail}</span>
                        <span><span className="font-medium text-foreground">IMAP:</span> {email.imapHost || '-'}:{email.imapPort}</span>
                        <span><span className="font-medium text-foreground">Mailbox:</span> {email.inboundMailboxFolder}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEmailEdit(email)} className="p-1">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEmailDelete(email.id)} className="p-1 text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingEmail ? 'Edit Email Config' : 'Create Email Config'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowEmailModal(false)} className="rounded-full w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-5">

              {/* Basic */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Basic</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="Config Name *"
                      value={emailForm.name}
                      onChange={e => setEmailForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Support Mailbox"
                    />
                  </div>
                  <Input
                    label="From Email *"
                    type="email"
                    value={emailForm.fromEmail}
                    onChange={e => setEmailForm(f => ({ ...f, fromEmail: e.target.value }))}
                    placeholder="support@company.com"
                  />
                  <Input
                    label="From Name"
                    value={emailForm.fromName}
                    onChange={e => setEmailForm(f => ({ ...f, fromName: e.target.value }))}
                    placeholder="Support Team"
                  />
                </div>
              </div>

              {/* SMTP */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">SMTP (Outgoing)</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SMTP Host *"
                    value={emailForm.smtpHost}
                    onChange={e => setEmailForm(f => ({ ...f, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                  <Input
                    label="SMTP Port * (1-65535)"
                    type="number"
                    min={1}
                    max={65535}
                    value={String(emailForm.port)}
                    onChange={e => setEmailForm(f => ({ ...f, port: Number(e.target.value) }))}
                    placeholder="587"
                  />
                  <Input
                    label="Username"
                    value={emailForm.userName}
                    onChange={e => setEmailForm(f => ({ ...f, userName: e.target.value }))}
                    placeholder="Email or username"
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={emailForm.password}
                      onChange={e => setEmailForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailForm.enableSsl}
                        onChange={e => setEmailForm(f => ({ ...f, enableSsl: e.target.checked }))}
                        className="rounded"
                      />
                      Enable SSL (SMTP)
                    </label>
                  </div>
                </div>
              </div>

              {/* IMAP */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">IMAP (Incoming)</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="IMAP Host"
                    value={emailForm.imapHost}
                    onChange={e => setEmailForm(f => ({ ...f, imapHost: e.target.value }))}
                    placeholder="imap.gmail.com"
                  />
                  <Input
                    label="IMAP Port (1-65535)"
                    type="number"
                    min={1}
                    max={65535}
                    value={String(emailForm.imapPort)}
                    onChange={e => setEmailForm(f => ({ ...f, imapPort: Number(e.target.value) }))}
                    placeholder="993"
                  />
                  <Input
                    label="Mailbox Folder"
                    value={emailForm.inboundMailboxFolder}
                    onChange={e => setEmailForm(f => ({ ...f, inboundMailboxFolder: e.target.value }))}
                    placeholder="INBOX"
                  />
                  <div className="flex flex-col gap-2 justify-end pb-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailForm.imapEnableSsl}
                        onChange={e => setEmailForm(f => ({ ...f, imapEnableSsl: e.target.checked }))}
                        className="rounded"
                      />
                      Enable SSL (IMAP)
                    </label>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Options</p>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emailForm.enableIncidentIngestion}
                      onChange={e => setEmailForm(f => ({ ...f, enableIncidentIngestion: e.target.checked }))}
                      className="rounded"
                    />
                    Enable Incident Ingestion
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emailForm.isActive}
                      onChange={e => setEmailForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    Is Active
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleEmailSubmit} disabled={emailSubmitting} className="gap-2">
                  <Save className="w-4 h-4" />
                  {emailSubmitting ? 'Saving...' : editingEmail ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Main renderContent ───────────────────────────────────────────
  const renderContent = () => {
    const activeTabData = allTabs.find(tab => (tab as any).id === activeTab);
    const code = activeTabData?.code;

    if (!activeTabData) return <div>Tab not found</div>;


    // ✅ SLA_CONFIG — real UI
    if (code === 'SLA_CONFIG') return renderSlaContent();

    // ✅ EMAIL_CONFIG — real UI
    if (code === 'EMAIL_CONFIG') return renderEmailContent();

    // ✅ ROLES — real UI
    if (code === 'ROLES') return renderRolesContent();

    const filteredData = getFilteredData();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold">{activeTabData.label} Management</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant={showInactive ? "secondary" : "outline"}
              onClick={() => setShowInactive(!showInactive)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              {showInactive ? "Hide Inactive" : "Show Inactive"}
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add {activeTabData.label}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={bulkToggleActive}>Toggle Active</Button>
                  <Button variant="danger" size="sm" onClick={bulkDelete}>Delete Selected</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Add/Edit {activeTabData.label}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="rounded-full w-8 h-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Name"
                  value={editingItem?.name || ''}
                  onChange={(e) => setEditingItem(editingItem ? { ...editingItem, name: e.target.value } : null)}
                  placeholder="Enter name"
                  required
                />

                {code !== 'DEPARTMENT' && (
                  <Input
                    label="Code"
                    value={editingItem?.code || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, code: e.target.value } : null)}
                    placeholder="Enter code (e.g., NETWORK)"
                  />
                )}

                {code === 'CATEGORY' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Department *</label>
                    <Select
                      value={editingItem?.departmentId || ''}
                      onChange={(value) => setEditingItem(editingItem ? { ...editingItem, departmentId: value } : null)}
                      options={(Array.isArray(departments) ? departments : []).map(dept => ({
                        value: dept.id,
                        label: dept.name
                      }))}
                      placeholder="Select department"
                    />
                  </div>
                )}

                {code === 'SUBCATEGORY' && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <Select
                        value={editingItem?.categoryId || ''}
                        onChange={(value) => {
                          const selectedCategory = categories.find(cat => cat.id === value);
                          setEditingItem(editingItem ? {
                            ...editingItem,
                            categoryId: value,
                            categoryName: selectedCategory?.name || '',
                            departmentId: (selectedCategory as any)?.departmentId || editingItem.departmentId
                          } : null);
                        }}
                        options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                        placeholder="Select category"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Department *</label>
                      <Select
                        value={editingItem?.departmentId || ''}
                        onChange={(value) => setEditingItem(editingItem ? { ...editingItem, departmentId: value } : null)}
                        options={departments.map(dept => ({ value: dept.id, label: dept.name }))}
                        placeholder="Select department"
                      />
                    </div>
                  </>
                )}

                {code === 'HOLIDAY' && (
                  <>
                    <Input
                      label="Date"
                      type="date"
                      value={editingItem?.date || ''}
                      onChange={(e) => setEditingItem(editingItem ? { ...editingItem, date: e.target.value } : null)}
                    />
                    <Input
                      label="Description"
                      value={editingItem?.description || ''}
                      onChange={(e) => setEditingItem(editingItem ? { ...editingItem, description: e.target.value } : null)}
                      placeholder="Holiday description"
                    />
                  </>
                )}

                {!['CATEGORY', 'SUBCATEGORY', 'HOLIDAY', 'DEPARTMENT', 'PRIORITY', 'SEVERITY', 'SOURCE', 'EMAIL_CONFIG', 'SLA_CONFIG'].includes(code || '') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Department *</label>
                    <Select
                      value={editingItem?.departmentId || ''}
                      onChange={(value) => setEditingItem(editingItem ? { ...editingItem, departmentId: value } : null)}
                      options={(Array.isArray(departments) ? departments : []).map(dept => ({
                        value: dept.id,
                        label: dept.name
                      }))}
                      placeholder="Select department"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data List */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Button variant="ghost" size="sm" onClick={toggleAllSelection} className="p-1">
                {selectedItems.length === filteredData.length && filteredData.length > 0 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1 grid grid-cols-12 gap-4 text-base font-bold text-muted-foreground">
                <div className={`${code === 'PRIORITY' ? 'col-span-6' : (code === 'HOLIDAY' || code === 'SEVERITY') ? 'col-span-8' : 'col-span-10'}`}>Name</div>
                {(code === 'PRIORITY' || code === 'SEVERITY') && <div className="col-span-2">Level</div>}
                {code === 'PRIORITY' && <div className="col-span-2">Color</div>}
                {code === 'HOLIDAY' && <div className="col-span-2">Date</div>}
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            <AnimatePresence>
              {filteredData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No items found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                filteredData.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="py-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" onClick={() => toggleItemSelection(item.id)} className="p-1">
                        {selectedItems.includes(item.id) ? <Check className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                      </Button>

                      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                        <div className={`${code === 'PRIORITY' ? 'col-span-6' : (code === 'HOLIDAY' || code === 'SEVERITY') ? 'col-span-8' : 'col-span-10'}`}>
                          <div className="flex items-center gap-2">
                            {item.color && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />}
                            <button onClick={() => toggleExpanded(item.id)} className="group/name flex items-center gap-1.5">
                              <h4 className="font-bold text-base group-hover/name:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/30">
                                {item.name}
                              </h4>
                              {isExpanded.includes(item.id) ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover/name:text-primary transition-colors" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover/name:text-primary transition-colors" />
                              )}
                            </button>
                          </div>
                        </div>

                        {(code === 'PRIORITY' || code === 'SEVERITY') && (
                          <div className="col-span-2">
                            {item.level ? (
                              <Badge variant="secondary" className="text-sm px-3 py-1">Level {item.level}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        )}

                        {code === 'PRIORITY' && (
                          <div className="col-span-2">
                            {item.color ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-mono font-medium">{item.color}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        )}

                        {code === 'HOLIDAY' && (
                          <div className="col-span-2">
                            {item.date ? (
                              <Badge variant="outline" className="text-sm px-3 py-1">{item.date}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        )}

                        <div className="col-span-2">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id)} className="p-1">
                              {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="p-1">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="p-1 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 ml-8 p-4 bg-muted/20 rounded-lg"
                      >
                        <MasterDataExpandedDetails
                          itemId={item.id}
                          masterTypeCode={code}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeTab && (
            <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Database className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Master Data</h1>
        </div>
        {!activeTab && (
          <Button onClick={() => { setEditingMasterType(null); setShowMasterTypeModal(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Master Type
          </Button>
        )}
      </div>

      {!activeTab ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabDynamic = (tab as any).isDynamic;
            
            return (
              <Card
                key={tab.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group relative overflow-hidden"
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start pr-8">
                        <h3 className="font-semibold text-lg mb-1">{tab.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{tab.description}</p>
                    </div>
                  </div>
                  
                  {isTabDynamic && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMasterType({ id: tab.id, name: tab.label, code: (tab as any).code });
                          setShowMasterTypeModal(true);
                        }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMasterType(tab.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      )}

      {/* Master Type Modal */}
      {showMasterTypeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-card text-card-foreground border border-border rounded-lg shadow-xl w-full max-w-md overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingMasterType ? 'Edit' : 'Add'} Master Type</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMasterTypeModal(false)} className="rounded-full w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <Input
                label="Name"
                value={editingMasterType?.name || ''}
                onChange={(e) => setEditingMasterType({ ...editingMasterType, name: e.target.value })}
                placeholder="e.g. Incident Type"
                required
              />
              <Input
                label="Code"
                value={editingMasterType?.code || ''}
                onChange={(e) => setEditingMasterType({ ...editingMasterType, code: e.target.value })}
                placeholder="e.g. INCIDENT_TYPE"
              />
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveMasterType} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowMasterTypeModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}