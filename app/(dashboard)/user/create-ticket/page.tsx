"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  Send,
  AlertCircle,
  Tag,
  Building,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/context/ToastContext';
import { apiGet, apiPost } from '@/lib/client-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownItem {
  id: string;
  name: string;
}

interface SubCategory extends DropdownItem {
  categoryId?: string;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  departmentId: '',
  categoryId: '',
  subCategoryId: '',
  priorityId: '',
  sourceId: '',
  slaId: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

const CreateTicketPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Dropdown data
  const [departments, setDepartments] = useState<DropdownItem[]>([]);
  const [categories, setCategories] = useState<DropdownItem[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [priorities, setPriorities] = useState<DropdownItem[]>([]);
  const [sources, setSources] = useState<DropdownItem[]>([]);
  const [slas, setSlas] = useState<DropdownItem[]>([]);

  // ─── Fetch dropdowns ────────────────────────────────────────────

  const fetchMasterDataByType = async (typeName: string): Promise<DropdownItem[]> => {
    try {
      const typesResult = await apiGet<any[]>('/api/mastertypes');
      if (!typesResult.success || !typesResult.data) return [];

      const masterType = typesResult.data.find((t: any) =>
        t.name?.toLowerCase().includes(typeName) ||
        typeName.includes(t.name?.toLowerCase()) ||
        t.code?.toLowerCase().includes(typeName) ||
        typeName.includes(t.code?.toLowerCase())
      );
      if (!masterType) return [];

      const result = await apiGet<any[]>(`/api/masterdata?masterTypeId=${masterType.id}`);
      if (!result.success || !result.data) return [];
      return (result.data as any[]).filter((i: any) => i.isActive !== false);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const load = async () => {
      const [depts, cats, subs, prios, srcs, slaList] = await Promise.all([
        apiGet<DropdownItem[]>('/api/departments'),
        apiGet<DropdownItem[]>('/api/categories'),
        apiGet<SubCategory[]>('/api/subcategories'),
        fetchMasterDataByType('priority'),
        fetchMasterDataByType('source'),
        apiGet<DropdownItem[]>('/api/sla-configurations'),
      ]);

      if (depts.success && depts.data) setDepartments(depts.data);
      if (cats.success && cats.data) setCategories(cats.data);
      if (subs.success && subs.data) setSubCategories(subs.data);
      setPriorities(prios);
      setSources(srcs);
      if (slaList.success && slaList.data) setSlas(slaList.data as DropdownItem[]);
    };
    load();
  }, []);

  // Filter subcategories based on selected category
  const filteredSubCategories = formData.categoryId
  ? subCategories.filter((s: any) =>
      s.categoryId === formData.categoryId
    )
  : [];

  // ─── Handlers ───────────────────────────────────────────────────

  const handleChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'categoryId') updated.subCategoryId = '';
      if (field === 'departmentId') {
        updated.categoryId = '';
        updated.subCategoryId = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return toast('Title is required', 'error');
    if (!formData.description.trim()) return toast('Description is required', 'error');
    if (!formData.departmentId) return toast('select Department  ', 'error');
    if (!formData.categoryId) return toast('select Category ', 'error');

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        departmentId: formData.departmentId,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId || null,
        priorityId: formData.priorityId || null,
        sourceId: formData.sourceId || null,
        slaId: formData.slaId || null,
        statusId: null,
        comments: [],
        attachments: [],
      };

      const result = await apiPost('/api/tickets', payload);

      if (result.success) {
        toast('Ticket created successfully!', 'success');
        setFormData(EMPTY_FORM);
      } else {
        toast(result.error || 'Failed to create ticket', 'error');
      }
    } catch {
      toast('Failed to create ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
        <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
          <Ticket className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Create Support Ticket</h1>
          <p className="text-muted-foreground">Tell us about your issue and we'll help you resolve it</p>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black tracking-tight">Ticket Details</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              Please provide as much detail as possible to help us resolve your issue quickly
            </p>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Ticket Title *</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={formData.title}
                      onChange={e => handleChange('title', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Detailed Description *</label>
                    <textarea
                      placeholder="Please describe your issue in detail..."
                      value={formData.description}
                      onChange={e => handleChange('description', e.target.value)}
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Classification */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" /> Issue Classification
                </h3>

                

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>
    <label className="text-sm font-medium mb-2 block">Department *</label>
    <Select
      value={formData.departmentId}
      onChange={val => handleChange('departmentId', val)}
      options={departments.map(d => ({ value: d.id, label: d.name }))}
      placeholder="Select department"
    />
  </div>

  <div>
    <label className="text-sm font-medium mb-2 block">Category *</label>
    <Select
      value={formData.categoryId}
      onChange={val => handleChange('categoryId', val)}
      options={categories
        .filter((c: any) => !formData.departmentId || c.departmentId === formData.departmentId)
        .map(c => ({ value: c.id, label: c.name }))}
      placeholder="Select category"
      disabled={!formData.departmentId}
    />
  </div>

  <div>
    <label className="text-sm font-medium mb-2 block">Subcategory</label>
    <Select
      value={formData.subCategoryId}
      onChange={val => handleChange('subCategoryId', val)}
      options={filteredSubCategories.map(s => ({ value: s.id, label: s.name }))}
      placeholder="Select subcategory"
      disabled={!formData.categoryId}
    />
  </div>

  <div>
    <label className="text-sm font-medium mb-2 block">Priority</label>
    <Select
      value={formData.priorityId}
      onChange={val => handleChange('priorityId', val)}
      options={priorities.map(p => ({ value: p.id, label: p.name }))}
      placeholder="Select priority"
    />
  </div>

  <div>
    <label className="text-sm font-medium mb-2 block">Source</label>
    <Select
      value={formData.sourceId}
      onChange={val => handleChange('sourceId', val)}
      options={sources.map(s => ({ value: s.id, label: s.name }))}
      placeholder="How are you reporting this?"
    />
  </div>
</div>
              </motion.div>

              {/* Additional Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="w-5 h-5" /> Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  

                  <div>
                    <label className="text-sm font-medium mb-2 block">SLA</label>
                    <Select
                      value={formData.slaId}
                      onChange={val => handleChange('slaId', val)}
                      options={slas.map(s => ({ value: s.id, label: s.name }))}
                      placeholder="Select SLA (optional)"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-6">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[140px]">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateTicketPage;