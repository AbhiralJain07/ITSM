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
  const [categories, setCategories] = useState<MasterDataItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<MasterDataItem[]>([]);
  const [priorities, setPriorities] = useState<MasterDataItem[]>([]);
  const [severities, setSeverities] = useState<MasterDataItem[]>([]);
  const [sources, setSources] = useState<MasterDataItem[]>([]);
  const [holidays, setHolidays] = useState<MasterDataItem[]>([]);
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  // ─── Fetch Functions ───────────────────────────────────────────────

  const getToken = () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;

  const authHeaders = (token: string | null) =>
    token ? { 'Authorization': `Bearer ${token}` } : {};

  const fetchCategoriesFromAPI = async () => {
    try {
      setCategoriesLoading(true);
      const token = getToken();
      const res = await fetch('/api/categories', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) {
        setCategories(Array.isArray(result.data) ? result.data : []);
      } else {
        toast(result.error || 'Failed to load categories', 'error');
        setCategories([]);
      }
    } catch (error) {
      toast('Failed to load categories', 'error');
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchDepartmentsFromAPI = async () => {
    try {
      setDepartmentsLoading(true);
      const token = getToken();
      const res = await fetch('/api/departments', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) {
        setDepartments(Array.isArray(result.data) ? result.data : []);
      } else {
        toast(result.error || 'Failed to load departments', 'error');
      }
    } catch (error) {
      toast('Failed to load departments', 'error');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchSubcategoriesFromAPI = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/subcategories', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) {
        setSubcategories(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      toast('Failed to load subcategories', 'error');
    }
  };

  const fetchHolidaysFromAPI = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/holidays', { headers: authHeaders(token) });
      const result = await res.json();
      if (result.success) {
        setHolidays(Array.isArray(result.data) ? result.data : []);
      }
    } catch (error) {
      toast('Failed to load holidays', 'error');
    }
  };

  const fetchMasterDataByType = async (
    typeName: string,
    setter: (data: MasterDataItem[]) => void,
    label: string
  ) => {
    try {
      const token = getToken();
      const typesRes = await fetch('/api/mastertypes', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
      const typesResult = await typesRes.json();
      const masterType = typesResult.data?.find((t: any) =>
  t.name?.toLowerCase().includes(typeName) || 
  typeName.includes(t.name?.toLowerCase()) ||
  t.code?.toLowerCase().includes(typeName) ||
  typeName.includes(t.code?.toLowerCase())
);

      if (!masterType) {
        setter([]);
        return;
      }

      const res = await fetch(`/api/masterdata?masterTypeId=${masterType.id}`, {
        headers: authHeaders(token)
      });
      const result = await res.json();
      if (result.success) {
        setter(
          result.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            code: item.code,
            level: item.sortOrder,
            isActive: item.isActive,
            masterTypeId: item.masterTypeId,
            departmentId: item.departmentId
          }))
        );
      }
    } catch (error) {
      toast(`Failed to load ${label}`, 'error');
    }
  };

  const fetchPrioritiesFromAPI = () =>
    fetchMasterDataByType('priority', setPriorities, 'priorities');

  const fetchSeveritiesFromAPI = () =>
    fetchMasterDataByType('severity', setSeverities, 'severities');

  const fetchSourcesFromAPI = () =>
  fetchMasterDataByType('sources', setSources, 'sources');

  // ─── useEffect ────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'category') {
      fetchCategoriesFromAPI();
      fetchDepartmentsFromAPI();
    }
    if (activeTab === 'department') {
      fetchDepartmentsFromAPI();
    }
    if (activeTab === 'subcategory') {
      fetchSubcategoriesFromAPI();
      fetchCategoriesFromAPI();
      fetchDepartmentsFromAPI();
    }
    if (activeTab === 'holiday') {
      fetchHolidaysFromAPI();
    }
    if (activeTab === 'priority') {
      fetchPrioritiesFromAPI();
    }
    if (activeTab === 'severity') {
      fetchSeveritiesFromAPI();
    }
    if (activeTab === 'source') {
      fetchSourcesFromAPI();
    }
  }, [activeTab]);

  // ─── Tabs ─────────────────────────────────────────────────────────

  const tabs = [
    { id: 'category', label: 'Category', icon: Tag, description: 'Manage ticket categories and classifications' },
    { id: 'subcategory', label: 'Subcategory', icon: Subtitles, description: 'Manage nested subcategories for tickets' },
    { id: 'priority', label: 'Priority', icon: AlertTriangle, description: 'Define SLA priorities and response times' },
    { id: 'severity', label: 'Severity', icon: Activity, description: 'Manage incident severities and impact levels' },
    { id: 'source', label: 'Source', icon: Mail, description: 'Configure ticket origin channels' },
    { id: 'holiday', label: 'Holiday', icon: Calendar, description: 'Manage organizational holidays for SLA calculations' },
    { id: 'department', label: 'Department', icon: Building, description: 'Manage company departments and groups' },
    { id: 'email', label: 'Email Config', icon: Settings, description: 'Configure IMAP/SMTP settings for email integration' },
    { id: 'sla', label: 'SLA Config', icon: Clock, description: 'Configure Service Level Agreements and rules' },
  ];

  // ─── Data Helpers ─────────────────────────────────────────────────

  const getData = (): MasterDataItem[] => {
    switch (activeTab) {
      case 'category': return categories;
      case 'subcategory': return subcategories;
      case 'priority': return priorities;
      case 'severity': return severities;
      case 'source': return sources;
      case 'holiday': return holidays;
      case 'department': return departments;
      default: return [];
    }
  };

  const setData = (data: MasterDataItem[]) => {
    switch (activeTab) {
      case 'category': setCategories(data); break;
      case 'subcategory': setSubcategories(data); break;
      case 'priority': setPriorities(data); break;
      case 'severity': setSeverities(data); break;
      case 'source': setSources(data); break;
      case 'holiday': setHolidays(data); break;
      case 'department': setDepartments(data); break;
    }
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
    const newItem: MasterDataItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      color: activeTab === 'priority' ? '#FF4444' : undefined,
      level: activeTab === 'priority' || activeTab === 'severity' ? 1 : undefined,
      date: activeTab === 'holiday' ? new Date().toISOString().split('T')[0] : undefined,
      categoryId: activeTab === 'subcategory' ? '' : undefined,
      categoryName: activeTab === 'subcategory' ? '' : undefined,
      code: activeTab === 'category' || activeTab === 'subcategory' || activeTab === 'priority' || activeTab === 'severity' || activeTab === 'source' ? '' : undefined,
      departmentId: activeTab === 'subcategory' ? '' : undefined,
      isActive: true,
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

    if (activeTab === 'category' && !editingItem?.departmentId?.trim()) {
      toast('Department is required for categories', 'error');
      return;
    }

    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      };

      // ── Category ──
      if (activeTab === 'category') {
        const isNew = !categories.find(c => c.id === editingItem.id);
        const res = await fetch(
          isNew ? '/api/categories' : `/api/categories/${editingItem.id}`,
          {
            method: isNew ? 'POST' : 'PUT',
            headers,
            body: JSON.stringify({
              name: editingItem.name,
              code: editingItem.code || editingItem.name?.toUpperCase().replace(/\s+/g, '_'),
              departmentId: editingItem.departmentId,
              isActive: editingItem.isActive
            })
          }
        );
        if (res.ok) {
          toast(isNew ? 'Category created successfully' : 'Category updated successfully', 'success');
          setShowModal(false); setEditingItem(null);
          await fetchCategoriesFromAPI();
        } else {
          const err = await res.json();
          toast(err.error || 'Failed to save category', 'error');
        }

      // ── Department ──
      } else if (activeTab === 'department') {
        const isNew = !departments.find(d => d.id === editingItem.id);
        const res = await fetch(
          isNew ? '/api/departments' : `/api/departments/${editingItem.id}`,
          { method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify({ name: editingItem.name }) }
        );
        const result = await res.json();
        if (result.success) {
          toast(isNew ? 'Department created successfully' : 'Department updated successfully', 'success');
          setShowModal(false); setEditingItem(null);
          await fetchDepartmentsFromAPI();
        } else {
          toast(result.error || 'Failed to save department', 'error');
        }

      // ── Subcategory ──
      } else if (activeTab === 'subcategory') {
        const isNew = !subcategories.find(s => s.id === editingItem.id);
        const res = await fetch(
          isNew ? '/api/subcategories' : `/api/subcategories/${editingItem.id}`,
          {
            method: isNew ? 'POST' : 'PUT',
            headers,
            body: JSON.stringify({
              name: editingItem.name,
              code: editingItem.code || editingItem.name?.toUpperCase().replace(/\s+/g, '_'),
              categoryId: editingItem.categoryId,
              departmentId: editingItem.departmentId,
              isActive: editingItem.isActive
            })
          }
        );
        const result = await res.json();
        if (result.success) {
          toast(isNew ? 'Subcategory created successfully' : 'Subcategory updated successfully', 'success');
          setShowModal(false); setEditingItem(null);
          await fetchSubcategoriesFromAPI();
        } else {
          toast(result.error || 'Failed to save subcategory', 'error');
        }

      // ── Holiday ──
      } else if (activeTab === 'holiday') {
        const isNew = !holidays.find(h => h.id === editingItem.id);
        const res = await fetch(
          isNew ? '/api/holidays' : `/api/holidays/${editingItem.id}`,
          {
            method: isNew ? 'POST' : 'PUT',
            headers,
            body: JSON.stringify({
              name: editingItem.name,
              date: editingItem.date,
              description: editingItem.description || '',
              isActive: editingItem.isActive
            })
          }
        );
        const result = await res.json();
        if (result.success) {
          toast(isNew ? 'Holiday created successfully' : 'Holiday updated successfully', 'success');
          setShowModal(false); setEditingItem(null);
          await fetchHolidaysFromAPI();
        } else {
          toast(result.error || 'Failed to save holiday', 'error');
        }

      // ── Priority / Severity / Source (MasterData) ──
      } else if (activeTab === 'priority' || activeTab === 'severity' || activeTab === 'source') {
  const typesRes = await fetch('/api/mastertypes', { headers });
  const typesResult = await typesRes.json();
  
  const typeNameMap: Record<string, string> = {
    'priority': 'priority',
    'severity': 'severity',
    'source': 'sources'  // backend mein 'sources' hai
  };
  const lookupName = typeNameMap[activeTab] || activeTab;
  
  const masterType = typesResult.data?.find((t: any) =>
    t.name?.toLowerCase() === lookupName || t.code?.toLowerCase() === lookupName
  );

        if (!masterType) {
          toast(`${activeTab} mastertype not found. Create it in Swagger first.`, 'error');
          return;
        }

        const currentList =
          activeTab === 'priority' ? priorities :
          activeTab === 'severity' ? severities : sources;

        const isNew = !currentList.find(p => p.id === editingItem.id);
        const res = await fetch(
          isNew ? '/api/masterdata' : `/api/masterdata/${editingItem.id}`,
          {
            method: isNew ? 'POST' : 'PUT',
            headers,
            body: JSON.stringify({
              masterTypeId: masterType.id,
              departmentId: editingItem.departmentId || departments[0]?.id,
              name: editingItem.name,
              code: editingItem.code || editingItem.name?.toUpperCase().replace(/\s+/g, '_'),
              sortOrder: editingItem.level || 0,
              isActive: editingItem.isActive
            })
          }
        );
        const result = await res.json();
        if (result.success) {
          toast(isNew ? `${activeTab} created successfully` : `${activeTab} updated successfully`, 'success');
          setShowModal(false); setEditingItem(null);
          if (activeTab === 'priority') await fetchPrioritiesFromAPI();
          else if (activeTab === 'severity') await fetchSeveritiesFromAPI();
          else await fetchSourcesFromAPI();
        } else {
          toast(result.error || `Failed to save ${activeTab}`, 'error');
        }

      // ── Local state fallback ──
      } else {
        const data = getData();
        const isNew = !data.find(item => item.id === editingItem.id);
        if (isNew) {
          setData([...data, editingItem]);
        } else {
          setData(data.map(item => item.id === editingItem.id ? editingItem : item));
        }
        toast('Item saved successfully', 'success');
        setShowModal(false); setEditingItem(null);
      }

    } catch (error) {
      console.error('Save error:', error);
      toast('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    const headers = authHeaders(token);

    if (activeTab === 'department') {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (result.success) { toast('Department deleted successfully', 'success'); await fetchDepartmentsFromAPI(); }
      else { toast(result.error || 'Failed to delete department', 'error'); }
      return;
    }

    if (activeTab === 'category') {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (result.success) { toast('Category deleted successfully', 'success'); await fetchCategoriesFromAPI(); }
      else { toast(result.error || 'Failed to delete category', 'error'); }
      return;
    }

    if (activeTab === 'subcategory') {
      const res = await fetch(`/api/subcategories/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (result.success) { toast('Subcategory deleted successfully', 'success'); await fetchSubcategoriesFromAPI(); }
      else { toast(result.error || 'Failed to delete subcategory', 'error'); }
      return;
    }

    if (activeTab === 'holiday') {
      const res = await fetch(`/api/holidays/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (result.success) { toast('Holiday deleted successfully', 'success'); await fetchHolidaysFromAPI(); }
      else { toast(result.error || 'Failed to delete holiday', 'error'); }
      return;
    }

    if (activeTab === 'priority' || activeTab === 'severity' || activeTab === 'source') {
      const res = await fetch(`/api/masterdata/${id}`, { method: 'DELETE', headers });
      const result = await res.json();
      if (result.success) {
        toast(`${activeTab} deleted successfully`, 'success');
        if (activeTab === 'priority') await fetchPrioritiesFromAPI();
        else if (activeTab === 'severity') await fetchSeveritiesFromAPI();
        else await fetchSourcesFromAPI();
      } else {
        toast(result.error || `Failed to delete ${activeTab}`, 'error');
      }
      return;
    }

    // Local state fallback
    const data = getData();
    setData(data.filter(item => item.id !== id));
    toast('Item deleted successfully', 'success');
  };

  const toggleActive = (id: string) => {
    const data = getData();
    setData(data.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  // ─── Render ───────────────────────────────────────────────────────

  const renderContent = () => {
    const filteredData = getFilteredData();
    const activeTabData = tabs.find(tab => tab.id === activeTab);

    if (!activeTabData) return <div>Tab not found</div>;

    if (activeTab === 'email' || activeTab === 'sla') {
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

                {activeTab !== 'department' && (
                  <Input
                    label="Code"
                    value={editingItem?.code || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, code: e.target.value } : null)}
                    placeholder="Enter code (e.g., NETWORK)"
                  />
                )}

                {activeTab === 'category' && (
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

                {activeTab === 'subcategory' && (
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">Category *</label>
                    <Select
                      value={editingItem?.categoryId || ''}
                      onChange={(value) => {
                        const selectedCategory = categories.find(cat => cat.id === value);
                        setEditingItem(editingItem ? {
                          ...editingItem,
                          categoryId: value,
                          categoryName: selectedCategory?.name || '',
                          departmentId: selectedCategory?.departmentId || editingItem.departmentId
                        } : null);
                      }}
                      options={categories.filter(cat => cat.isActive).map(item => ({
                        value: item.id,
                        label: item.name
                      }))}
                      placeholder="Select category"
                    />
                  </div>
                )}

                {activeTab === 'subcategory' && (
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

                {activeTab === 'priority' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Color"
                      type="color"
                      value={editingItem?.color || '#FF4444'}
                      onChange={(e) => setEditingItem(editingItem ? { ...editingItem, color: e.target.value } : null)}
                    />
                    <Input
                      label="Level"
                      type="number"
                      value={editingItem?.level || 1}
                      onChange={(e) => setEditingItem(editingItem ? { ...editingItem, level: parseInt(e.target.value) } : null)}
                      min="1"
                      max="3"
                    />
                  </div>
                )}

                {activeTab === 'severity' && (
                  <Input
                    label="Level"
                    type="number"
                    value={editingItem?.level || 1}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, level: parseInt(e.target.value) } : null)}
                    min="1"
                    max="4"
                  />
                )}

                {activeTab === 'holiday' && (
                  <Input
                    label="Date"
                    type="date"
                    value={editingItem?.date || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, date: e.target.value } : null)}
                  />
                )}

                {activeTab === 'holiday' && (
                  <Input
                    label="Description"
                    value={editingItem?.description || ''}
                    onChange={(e) => setEditingItem(editingItem ? { ...editingItem, description: e.target.value } : null)}
                    placeholder="Enter holiday description"
                  />
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
                <div className={`${activeTab === 'priority' ? 'col-span-6' : (activeTab === 'holiday' || activeTab === 'severity') ? 'col-span-8' : 'col-span-10'}`}>Name</div>
                {(activeTab === 'priority' || activeTab === 'severity') && <div className="col-span-2">Level</div>}
                {activeTab === 'priority' && <div className="col-span-2">Color</div>}
                {activeTab === 'holiday' && <div className="col-span-2">Date</div>}
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
                        <div className={`${activeTab === 'priority' ? 'col-span-6' : (activeTab === 'holiday' || activeTab === 'severity') ? 'col-span-8' : 'col-span-10'}`}>
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

                        {(activeTab === 'priority' || activeTab === 'severity') && (
                          <div className="col-span-2">
                            {item.level ? (
                              <Badge variant="secondary" className="text-sm px-3 py-1">Level {item.level}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        )}

                        {activeTab === 'priority' && (
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

                        {activeTab === 'holiday' && (
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
                            {activeTab === 'subcategory' && (item.categoryName || item.categoryId) && (
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
      <div className="flex items-center gap-3">
        {activeTab && (
          <Button variant="ghost" size="sm" onClick={() => setActiveTab(null)} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        )}
        <Database className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Master Data</h1>
      </div>

      {!activeTab ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Card
                key={tab.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{tab.label}</h3>
                      <p className="text-sm text-muted-foreground">{tab.description}</p>
                    </div>
                  </div>
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
    </div>
  );
}