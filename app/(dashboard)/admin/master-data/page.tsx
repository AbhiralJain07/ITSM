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
  MoreVertical
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
}

export default function MasterDataPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('category');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isExpanded, setIsExpanded] = useState<string[]>([]);

  // Fetch real categories from API
  const fetchCategoriesFromAPI = async () => {
    try {
      setCategoriesLoading(true);
      console.log('=== FETCHING CATEGORIES START ===');
      
      // Get the authorization token from sessionStorage
      const accessToken = typeof window !== 'undefined' 
        ? sessionStorage.getItem('accessToken')
        : null;
      
      console.log('Access token from sessionStorage:', accessToken ? 'Present' : 'Not found');
      
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
        console.log('Sending authorization token');
      }
      
      // Get departmentId from session storage
      let departmentId = '';
      if (typeof window !== 'undefined') {
        try {
          const sessionData = sessionStorage.getItem('userSession');
          if (sessionData) {
            const session = JSON.parse(sessionData);
            departmentId = session?.company?.id || '';
          }
        } catch (error) {
          console.warn('Failed to parse session data:', error);
        }
      }
      
      console.log('User department ID:', departmentId);
      
      // Build URL with departmentId if available
      let apiUrl = '/api/categories';
      if (departmentId) {
        apiUrl += `?departmentId=${departmentId}`;
      }
      
      console.log('Making request to:', apiUrl, 'with headers:', headers);
      
      const response = await fetch(apiUrl, { headers });
      
      console.log('=== RESPONSE RECEIVED ===');
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Read response body only ONCE
      const responseText = await response.text();
      console.log('=== RAW RESPONSE TEXT ===');
      console.log(responseText);
      console.log('=== END RAW RESPONSE ===');
      
      if (!response.ok) {
        console.error('=== API REQUEST FAILED ===');
        console.error('Status:', response.status);
        console.error('Raw response:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error('Parsed error data:', errorData);
        } catch {
          errorData = { error: responseText };
          console.error('Could not parse error as JSON, using raw text');
        }
        
        // Special handling for 500 errors
        if (response.status === 500) {
          console.error('=== 500 INTERNAL SERVER ERROR ===');
          console.error('Server-side issue detected');
          console.error('Error details:', errorData);
          throw new Error(`Server error: ${errorData.error || 'Internal server error occurred. Please check server logs.'}`);
        }
        
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      // Parse the successful response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid JSON response from API');
      }
      
      console.log('Parsed API result:', result);
      
      if (result.success && result.data) {
        console.log('Setting categories with data:', result.data);
        setCategories(result.data);
        console.log('Categories loaded from API:', result.data);
        
        if (result.data.length > 0) {
          toast('Categories loaded successfully', 'success');
        } else {
          toast('No categories found in the system', 'error');
        }
      } else {
        console.error('No data in API response');
        console.error('Full API response:', result);
        
        // Debug the response structure
        if (result.success === false) {
          console.error('API returned success=false:', result.error);
          throw new Error(result.error || 'API returned no data');
        } else if (!result.data) {
          console.error('API response missing data field');
          throw new Error('API response missing data field');
        } else {
          console.error('Unexpected response structure');
          throw new Error('Unexpected API response structure');
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories from API';
      toast(errorMessage, 'error');
      setCategories([]); // Set empty instead of fallback
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load categories on component mount and when tab changes to category
  useEffect(() => {
    if (activeTab === 'category') {
      fetchCategoriesFromAPI();
    }
  }, [activeTab]);

  // Mock data for other sections (categories will be loaded from API)
  const [categories, setCategories] = useState<MasterDataItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [subcategories, setSubcategories] = useState<MasterDataItem[]>([
    { id: '1', name: 'WiFi Issue', description: 'WiFi connectivity problems', isActive: true, categoryId: '1', categoryName: 'Network' },
    { id: '2', name: 'System Issue', description: 'System performance problems', isActive: true, categoryId: '2', categoryName: 'Hardware' },
    { id: '3', name: 'Printer Issue', description: 'Printer connectivity problems', isActive: true, categoryId: '2', categoryName: 'Hardware' },
    { id: '4', name: 'Internet Issue', description: 'Internet connectivity problems', isActive: true, categoryId: '1', categoryName: 'Network' },
    { id: '5', name: 'Application Crash', description: 'Application suddenly closing', isActive: true, categoryId: '3', categoryName: 'Software' },
  ]);

  const [priorities, setPriorities] = useState<MasterDataItem[]>([
    { id: '1', name: 'High', description: 'High priority issues', color: '#FF4444', level: 1, isActive: true },
    { id: '2', name: 'Medium', description: 'Medium priority issues', color: '#FFA500', level: 2, isActive: true },
    { id: '3', name: 'Low', description: 'Low priority issues', color: '#22C55E', level: 3, isActive: true },
  ]);

  const [severities, setSeverities] = useState<MasterDataItem[]>([
    { id: '1', name: 'Critical', description: 'Critical severity issues', level: 1, isActive: true },
    { id: '2', name: 'High', description: 'High severity issues', level: 2, isActive: true },
    { id: '3', name: 'Medium', description: 'Medium severity issues', level: 3, isActive: true },
    { id: '4', name: 'Low', description: 'Low severity issues', level: 4, isActive: true },
  ]);

  const [sources, setSources] = useState<MasterDataItem[]>([
    { id: '1', name: 'Email', description: 'Issues reported via email', isActive: true },
    { id: '2', name: 'Phone', description: 'Issues reported via phone', isActive: true },
    { id: '3', name: 'Walk-in', description: 'Issues reported in person', isActive: true },
    { id: '4', name: 'Self-Service Portal', description: 'Issues reported via portal', isActive: true },
  ]);

  const [holidays, setHolidays] = useState<MasterDataItem[]>([
    { id: '1', name: 'Republic Day', description: '26th January', date: '2024-01-26', isActive: true },
    { id: '2', name: 'Holi', description: 'Festival of colors', date: '2024-03-25', isActive: true },
    { id: '3', name: 'Diwali', description: 'Festival of lights', date: '2024-11-01', isActive: true },
  ]);

  // const [departments, setDepartments] = useState<MasterDataItem[]>([
  //   { id: '1', name: 'IT', description: 'Information Technology Department', isActive: true },
  //   { id: '2', name: 'HR', description: 'Human Resources Department', isActive: true },
  //   { id: '3', name: 'Finance', description: 'Finance Department', isActive: true },
  // ]);
  const [departments, setDepartments] = useState<MasterDataItem[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const fetchDepartmentsFromAPI = async () => {
  try {
    setDepartmentsLoading(true);

    // sessionStorage se token nikalo (tumhara login yehi use karta hai)
    const accessToken = typeof window !== 'undefined'
      ? sessionStorage.getItem('accessToken')
      : null;

    const res = await fetch('/api/departments', {
      headers: accessToken ? {
        'Authorization': `Bearer ${accessToken}`
      } : {}
    });

    const result = await res.json();
    console.log('Departments result:', result);

    if (result.success) {
  setDepartments(Array.isArray(result.data) ? result.data : []);
}else {
      toast('Failed to load departments: ' + result.error, 'error');
    }
  } catch (error) {
    toast('Failed to load departments', 'error');
  } finally {
    setDepartmentsLoading(false);
  }
};

  useEffect(() => {
  if (activeTab === 'category') {
    fetchCategoriesFromAPI();
    fetchDepartmentsFromAPI(); // ← ye add karo
  }
  if (activeTab === 'department') {
    fetchDepartmentsFromAPI();
  }
}, [activeTab]);


  const tabs = [
    { id: 'category', label: 'Category', icon: Tag },
    { id: 'subcategory', label: 'Subcategory', icon: Subtitles },
    { id: 'priority', label: 'Priority', icon: AlertTriangle },
    { id: 'severity', label: 'Severity', icon: Activity },
    { id: 'source', label: 'Source', icon: Mail },
    { id: 'holiday', label: 'Holiday', icon: Calendar },
    { id: 'department', label: 'Department', icon: Building },
    { id: 'email', label: 'Email Config', icon: Settings },
    { id: 'sla', label: 'SLA Config', icon: Clock },
  ];

  const getData = () => {
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

  // Get filtered and sorted data
  const getFilteredData = () => {
    const data = getData();
    
    let filtered = data.filter(item => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      const matchesActive = showInactive || item.isActive !== false;
      return matchesSearch && matchesActive;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'level') {
        aValue = a.level || 0;
        bValue = b.level || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
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
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const bulkDelete = () => {
    if (selectedItems.length === 0) {
      toast('No items selected', 'error');
      return;
    }

    const data = getData();
    setData(data.filter(item => !selectedItems.includes(item.id)));
    toast(`Deleted ${selectedItems.length} items successfully`, 'success');
    setSelectedItems([]);
  };

  const bulkToggleActive = () => {
    if (selectedItems.length === 0) {
      toast('No items selected', 'error');
      return;
    }

    const data = getData();
    setData(data.map(item => 
      selectedItems.includes(item.id) 
        ? { ...item, isActive: !item.isActive }
        : item
    ));
    toast(`Updated ${selectedItems.length} items successfully`, 'success');
    setSelectedItems([]);
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

  const handleAdd = () => {
    // Get departmentId from session storage
    let departmentId = '';
    if (typeof window !== 'undefined') {
      try {
        const sessionData = sessionStorage.getItem('userSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          departmentId = session?.company?.id || '';
        }
      } catch (error) {
        console.warn('Failed to parse session data:', error);
      }
    }
    
    const newItem: MasterDataItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      color: activeTab === 'priority' ? '#FF4444' : undefined,
      level: activeTab === 'priority' || activeTab === 'severity' ? 1 : undefined,
      date: activeTab === 'holiday' ? new Date().toISOString().split('T')[0] : undefined,
      categoryId: activeTab === 'subcategory' ? '' : undefined,
      categoryName: activeTab === 'subcategory' ? '' : undefined,
      code: activeTab === 'category' ? '' : undefined,
      departmentId: departmentId, // Set default departmentId from session
      isActive: true,
    };
    setEditingItem(newItem);
    setIsEditing(true);
  };

  const handleEdit = (item: MasterDataItem) => {
    setEditingItem({ ...item });
    setIsEditing(true);
  };

const handleSave = async () => {
  if (!editingItem?.name.trim()) {
    toast('Name is required', 'error');
    return;
  }

  if (activeTab === 'category' && !editingItem?.departmentId?.trim()) {
    toast('Department ID is required for categories', 'error');
    return;
  }

  try {
    if (activeTab === 'category') {
      const accessToken = typeof window !== 'undefined'
        ? sessionStorage.getItem('accessToken') : null;

      const categoryData = {
        name: editingItem.name,
        code: editingItem.code || editingItem.name?.toUpperCase().replace(/\s+/g, '_'),
        departmentId: editingItem.departmentId,
        isActive: editingItem.isActive
      };

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        toast('Category created successfully', 'success');
        setIsEditing(false);
        setEditingItem(null);
        await fetchCategoriesFromAPI();
      } else {
        const errorData = await response.json();
        toast(errorData.error || 'Failed to create category', 'error');
      }

    } else if (activeTab === 'department') {
      const accessToken = typeof window !== 'undefined'
        ? sessionStorage.getItem('accessToken') : null;

      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ name: editingItem.name })
      });

      const result = await res.json();
      if (result.success) {
        toast('Department created successfully', 'success');
        setIsEditing(false);
        setEditingItem(null);
        await fetchDepartmentsFromAPI();
      } else {
        toast(result.error || 'Failed to create department', 'error');
      }

    } else {
      // Local state for other tabs
      const data = getData();
      const isNew = !data.find(item => item.id === editingItem.id);
      if (isNew) {
        setData([...data, editingItem]);
      } else {
        setData(data.map(item => item.id === editingItem.id ? editingItem : item));
      }
      toast('Item saved successfully', 'success');
      setIsEditing(false);
      setEditingItem(null);
    }

  } catch (error) {
    console.error('Save error:', error);
    toast('Failed to save item', 'error');
  }
};

  const handleDelete = (id: string) => {
    const data = getData();
    setData(data.filter(item => item.id !== id));
    toast('Item deleted successfully', 'success');
  };

  const toggleActive = (id: string) => {
    const data = getData();
    setData(data.map(item => 
      item.id === id ? { ...item, isActive: !item.isActive } : item
    ));
  };

  const renderContent = () => {
    const filteredData = getFilteredData();
    const activeTabData = tabs.find(tab => tab.id === activeTab);

    if (!activeTabData) {
      return <div>Tab not found</div>;
    }

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
        {/* Header with Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-2xl font-bold">{activeTabData.label} Management</h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add {activeTabData.label}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onChange={(value) => setSortBy(value as 'name' | 'level' | 'date')}
                  options={[
                    { value: 'name', label: 'Sort by Name' },
                    { value: 'level', label: 'Sort by Level' },
                    { value: 'date', label: 'Sort by Date' }
                  ]}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="gap-1"
                >
                  {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  variant={showInactive ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setShowInactive(!showInactive)}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Inactive
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={bulkToggleActive}>
                      Toggle Active
                    </Button>
                    <Button variant="danger" size="sm" onClick={bulkDelete}>
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {editingItem?.id === Date.now().toString() ? 'Add New' : 'Edit'} {activeTabData.label}
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Name"
                value={editingItem?.name || ''}
                onChange={(e) => setEditingItem(editingItem ? { ...editingItem, name: e.target.value } : null)}
                placeholder="Enter name"
                required
              />
              <Input
                label="Code"
                value={editingItem?.code || ''}
                onChange={(e) => setEditingItem(editingItem ? { ...editingItem, code: e.target.value } : null)}
                placeholder="Enter code (e.g., NETWORK)"
              />
              {activeTab === 'category' ? (
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
) : null}
              {/* <Input
                label="Description"
                value={editingItem?.description || ''}
                onChange={(e) => setEditingItem(editingItem ? { ...editingItem, description: e.target.value } : null)}
                placeholder="Enter description"
              /> */}
              
              {activeTab === 'subcategory' && (
                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                    Category *
                  </label>
                  <Select
                    value={editingItem?.categoryId || ''}
                    onChange={(value) => {
                      const selectedCategory = categories.find(cat => cat.id === value);
                      setEditingItem(editingItem ? { 
                        ...editingItem, 
                        categoryId: value,
                        categoryName: selectedCategory?.name || ''
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
              
              {(activeTab === 'priority') && (
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

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data List */}
        <Card>
          <CardContent className="p-6">
            {/* List Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllSelection}
                className="p-1"
              >
                {selectedItems.length === filteredData.length && filteredData.length > 0 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-3">Name</div>
                {activeTab === 'subcategory' && (
                  <div className="col-span-2">Category</div>
                )}
                {(activeTab === 'priority' || activeTab === 'severity') && (
                  <div className="col-span-2">Level</div>
                )}
                {activeTab === 'priority' && (
                  <div className="col-span-2">Color</div>
                )}
                {activeTab === 'holiday' && (
                  <div className="col-span-2">Date</div>
                )}
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>

            {/* Data Items */}
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
                    className="flex items-center gap-4 py-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Checkbox */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleItemSelection(item.id)}
                      className="p-1"
                    >
                      {selectedItems.includes(item.id) ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>

                    {/* Item Content */}
                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      {/* Name */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          {item.color && (
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: item.color }} 
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(item.id)}
                              className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded.includes(item.id) ? (
                                <><EyeOff className="w-3 h-3 inline mr-1" /> Hide</>
                              ) : (
                                <><Eye className="w-3 h-3 inline mr-1" /> Details</>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {/* <div className="col-span-3">
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description || 'No description'}
                        </p>
                      </div> */}

                      {/* Category - Only for subcategory */}
                      {activeTab === 'subcategory' && item.categoryName && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">
                            {item.categoryName}
                          </Badge>
                        </div>
                      )}

                      {/* Level */}
                      {(activeTab === 'priority' || activeTab === 'severity') && item.level && (
                        <div className="col-span-2">
                          <Badge variant="secondary" className="text-xs">
                            Level {item.level}
                          </Badge>
                        </div>
                      )}

                      {/* Color */}
                      {activeTab === 'priority' && item.color && (
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <span className="text-xs font-mono">{item.color}</span>
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      {activeTab === 'holiday' && item.date && (
                        <div className="col-span-2">
                          <Badge variant="outline" className="text-xs">
                            {item.date}
                          </Badge>
                        </div>
                      )}

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(item.id)}
                            className="p-1"
                          >
                            {item.isActive ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            className="p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="col-span-12 mt-4 p-4 bg-muted/20 rounded-lg"
                      >
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">ID:</span> {item.id}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> {item.isActive ? 'Active' : 'Inactive'}
                          </div>
                          {item.level && (
                            <div>
                              <span className="font-medium">Level:</span> {item.level}
                            </div>
                          )}
                          {item.color && (
                            <div>
                              <span className="font-medium">Color:</span> {item.color}
                            </div>
                          )}
                          {item.date && (
                            <div>
                              <span className="font-medium">Date:</span> {item.date}
                            </div>
                          )}
                          {item.categoryName && (
                            <div>
                              <span className="font-medium">Category:</span> {item.categoryName}
                            </div>
                          )}
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
        <Database className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Master Data</h1>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};
