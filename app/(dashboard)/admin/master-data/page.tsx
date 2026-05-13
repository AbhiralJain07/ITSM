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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';

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

  // ─── Fetch Functions ───────────────────────────────────────────────

  const getToken = () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

  const authHeaders = (token: string | null): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const fetchMasterTypes = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      const res = await fetch('/api/mastertypes', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) {
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
      const token = getToken();
      const activeTabData = allTabs.find(t => t.id === typeId);
      const code = activeTabData?.code;

      let endpoint = `/api/masterdata?masterTypeId=${typeId}`;
      if (code === 'DEPARTMENT') endpoint = '/api/departments';
      else if (code === 'CATEGORY') endpoint = '/api/categories';
      else if (code === 'SUBCATEGORY') endpoint = '/api/subcategories';
      else if (code === 'HOLIDAY') endpoint = '/api/holidays';

      const res = await fetch(endpoint, {
        headers: authHeaders(token)
      });
      const result = await res.json();
      if (result.success) {
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
      const token = getToken();
      const res = await fetch('/api/departments', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) setDepartments(result.data || []);
    } catch (error) {}
  };

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/categories', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) setCategories(result.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchMasterTypes();
    fetchDepartments();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab) {
      fetchMasterDataByTypeId(activeTab);
    }
  }, [activeTab]);

  // ─── Tabs ─────────────────────────────────────────────────────────

  const allTabs = useMemo(() => {
    // Start with static tabs
    const tabsMap = new Map();
    
    STATIC_TABS.forEach(tab => {
      // Find matching masterType from backend to get its UUID
      const mt = masterTypes.find(m => m.code === tab.code);
      tabsMap.set(tab.code, {
        ...tab,
        id: mt ? mt.id : tab.id, // Use backend UUID if available, else static ID
        isStatic: true
      });
    });

    // Add any other dynamic master types from backend
    masterTypes.forEach(mt => {
      if (!tabsMap.has(mt.code)) {
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

  const getData = (): MasterDataItem[] => {
    return masterItems;
  };

  const setData = (data: MasterDataItem[]) => {
    setMasterItems(data);
  };

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
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      };

      const activeTabData = allTabs.find(t => t.id === activeTab);
      const code = activeTabData?.code;
      const isNew = !masterItems.find(item => item.id === editingItem.id);

      let res;
      let body: any = { ...editingItem };
      
      // Cleanup body for generic MasterData
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

      if (code === 'DEPARTMENT') {
        res = await fetch(isNew ? '/api/departments' : `/api/departments/${editingItem.id}`, {
          method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(body)
        });
      } else if (code === 'CATEGORY') {
        res = await fetch(isNew ? '/api/categories' : `/api/categories/${editingItem.id}`, {
          method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(body)
        });
      } else if (code === 'SUBCATEGORY') {
        res = await fetch(isNew ? '/api/subcategories' : `/api/subcategories/${editingItem.id}`, {
          method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(body)
        });
      } else if (code === 'HOLIDAY') {
        res = await fetch(isNew ? '/api/holidays' : `/api/holidays/${editingItem.id}`, {
          method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(body)
        });
      } else {
        // Generic MasterData
        res = await fetch(isNew ? '/api/masterdata' : `/api/masterdata/${editingItem.id}`, {
          method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(body)
        });
      }

      const result = await res.json();
      if (result.success || res.ok) {
        toast(isNew ? 'Item created successfully' : 'Item updated successfully', 'success');
        setShowModal(false); 
        setEditingItem(null);
        await fetchMasterDataByTypeId(activeTab as string);
        
        // Refresh specific dependency lists
        if (code === 'DEPARTMENT') fetchDepartments();
        if (code === 'CATEGORY') fetchCategories();
      } else {
        toast(result.error || 'Failed to save item', 'error');
      }

    } catch (error) {
      console.error('Save error:', error);
      toast('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = getToken();
      const headers = authHeaders(token);
      const activeTabData = allTabs.find(t => t.id === activeTab);
      const code = activeTabData?.code;

      let endpoint = `/api/masterdata/${id}`;
      if (code === 'DEPARTMENT') endpoint = `/api/departments/${id}`;
      else if (code === 'CATEGORY') endpoint = `/api/categories/${id}`;
      else if (code === 'SUBCATEGORY') endpoint = `/api/subcategories/${id}`;
      else if (code === 'HOLIDAY') endpoint = `/api/holidays/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE', headers });
      const result = await res.json();
      
      if (result.success || res.ok) {
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
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      };

      const isNew = !masterTypes.find(mt => mt.id === editingMasterType.id);
      const res = await fetch(
        isNew ? '/api/mastertypes' : `/api/mastertypes/${editingMasterType.id}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers,
          body: JSON.stringify({
            name: editingMasterType.name,
            code: editingMasterType.code || editingMasterType.name?.toUpperCase().replace(/\s+/g, '_'),
            isActive: true
          })
        }
      );

      if (res.ok) {
        toast(isNew ? 'Master Type created successfully' : 'Master Type updated successfully', 'success');
        setShowMasterTypeModal(false);
        setEditingMasterType(null);
        await fetchMasterTypes();
      } else {
        const err = await res.json();
        toast(err.error || 'Failed to save master type', 'error');
      }
    } catch (error) {
      toast('Failed to save master type', 'error');
    }
  };

  const handleDeleteMasterType = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Master Type? All associated data will be lost.')) return;

    try {
      const token = getToken();
      const res = await fetch(`/api/mastertypes/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token)
      });

      if (res.ok) {
        toast('Master Type deleted successfully', 'success');
        await fetchMasterTypes();
      } else {
        const err = await res.json();
        toast(err.error || 'Failed to delete master type', 'error');
      }
    } catch (error) {
      toast('Failed to delete master type', 'error');
    }
  };

  const toggleActive = (id: string) => {
    const data = getData();
    setData(data.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  const renderContent = () => {
    const filteredData = getFilteredData();
    const activeTabData = allTabs.find(tab => (tab as any).id === activeTab);
    const code = activeTabData?.code;

    if (!activeTabData) return <div>Tab not found</div>;

    if (code === 'EMAIL_CONFIG' || code === 'SLA_CONFIG') {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <activeTabData.icon className="w-6 h-6" />
                {activeTabData.label} Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>{activeTabData.label} configuration coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

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

                {(code === 'PRIORITY' || code === 'SEVERITY') && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Level / Sort Order"
                      type="number"
                      value={editingItem?.level || 0}
                      onChange={(e) => setEditingItem(editingItem ? { ...editingItem, level: parseInt(e.target.value) } : null)}
                    />
                    {code === 'PRIORITY' && (
                      <Input
                        label="Color"
                        type="color"
                        value={editingItem?.color || '#FF4444'}
                        onChange={(e) => setEditingItem(editingItem ? { ...editingItem, color: e.target.value } : null)}
                      />
                    )}
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
                        <div className="flex flex-col gap-5 text-base">
                          <div className="flex flex-col gap-4">
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">ID</span>
                              <p className="font-mono mt-1 text-base">{item.id}</p>
                            </div>
                            {code === 'SUBCATEGORY' && (item.categoryName || item.categoryId) && (
                              <div>
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Category</span>
                                <p className="mt-1 text-base">{item.categoryName || categories.find(c => c.id === item.categoryId)?.name || '-'}</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/50">
                            {item.level && (
                              <div>
                                <span className="font-medium text-muted-foreground text-sm uppercase tracking-wider">Level</span>
                                <p className="mt-1 text-base">{item.level}</p>
                              </div>
                            )}
                            {item.color && (
                              <div>
                                <span className="font-medium text-muted-foreground text-sm uppercase tracking-wider">Color</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                  <span className="text-base">{item.color}</span>
                                </div>
                              </div>
                            )}
                            {item.date && (
                              <div>
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Date</span>
                                <p className="mt-1 text-base">{item.date}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.description && (
                          <div className="mt-4">
                            <span className="font-medium">Description:</span>
                            <p className="mt-1 text-muted-foreground">{item.description}</p>
                          </div>
                        )}
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