"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Send, 
  AlertCircle, 
  CheckCircle,
  Tag,
  Subtitles,
  AlertTriangle,
  Activity,
  Mail,
  Building,
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/Providers';

interface MasterDataItem {
  id: string;
  name: string;
  description: string;
  color?: string;
  level?: number;
  isActive: boolean;
}

interface TicketFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: string;
  severity: string;
  source: string;
  department: string;
  urgency: string;
  impact: string;
}

const CreateTicketPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterData, setMasterData] = useState<Record<string, MasterDataItem[]>>({});
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    priority: '',
    severity: '',
    source: '',
    department: '',
    urgency: '',
    impact: ''
  });

  // Fetch master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const types = ['category', 'subcategory', 'priority', 'severity', 'source', 'department'];
        const data: Record<string, MasterDataItem[]> = {};
        
        for (const type of types) {
          const response = await fetch(`/api/master-data/${type}`);
          if (response.ok) {
            const result = await response.json();
            data[type] = result.data;
          }
        }
        
        setMasterData(data);
      } catch (error) {
        console.error('Failed to fetch master data:', error);
        toast('Failed to load form options', 'error');
      }
    };

    fetchMasterData();
  }, [toast]);

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset dependent fields when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const getPriorityColor = (priorityName: string) => {
    const priority = masterData.priority?.find(p => p.name === priorityName);
    return priority?.color || '#666';
  };

  const getPriorityLevel = (priorityName: string) => {
    const priority = masterData.priority?.find(p => p.name === priorityName);
    return priority?.level || 0;
  };

  const getSeverityLevel = (severityName: string) => {
    const severity = masterData.severity?.find(s => s.name === severityName);
    return severity?.level || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['title', 'description', 'category', 'subcategory', 'priority', 'severity', 'source', 'department'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof TicketFormData]);
    
    if (missingFields.length > 0) {
      toast(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create ticket object with master data details
      const ticketData = {
        ...formData,
        userId: user?.id,
        userName: user?.name,
        userEmail: user?.email,
        priorityColor: getPriorityColor(formData.priority),
        priorityLevel: getPriorityLevel(formData.priority),
        severityLevel: getSeverityLevel(formData.severity),
        createdAt: new Date().toISOString(),
        status: 'Open'
      };

      console.log('Submitting ticket:', ticketData);
      
      // Here you would make API call to create ticket
      // const response = await fetch('/api/tickets', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(ticketData)
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast('Ticket created successfully! Reference: INC-' + Math.floor(Math.random() * 10000), 'success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        priority: '',
        severity: '',
        source: '',
        department: '',
        urgency: '',
        impact: ''
      });
      
    } catch (error) {
      console.error('Failed to create ticket:', error);
      toast('Failed to create ticket. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
          <Ticket className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Create Support Ticket</h1>
          <p className="text-muted-foreground">Tell us about your issue and we'll help you resolve it</p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
                  <AlertCircle className="w-5 h-5" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Ticket Title *
                    </label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      How are you reporting this? *
                    </label>
                    <Select
                      value={formData.source}
                      onChange={(value) => handleInputChange('source', value)}
                      options={masterData.source?.map(item => ({
                        value: item.id,
                        label: item.name
                      })) || []}
                      placeholder="Select source"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                    Detailed Description *
                  </label>
                  <textarea
                    placeholder="Please describe your issue in detail. What happened? When did it start? What have you tried?"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    rows={4}
                    required
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </motion.div>

              {/* Classification */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Issue Classification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Category *
                    </label>
                    <Select
                      value={formData.category}
                      onChange={(value) => handleInputChange('category', value)}
                      options={masterData.category?.map(item => ({
                        value: item.id,
                        label: item.name
                      })) || []}
                      placeholder="Select category"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Subcategory *
                    </label>
                    <Select
                      value={formData.subcategory}
                      onChange={(value) => handleInputChange('subcategory', value)}
                      options={masterData.subcategory?.map(item => ({
                        value: item.id,
                        label: item.name
                      })) || []}
                      placeholder="Select subcategory"
                      disabled={!formData.category}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Priority *
                    </label>
                    <Select
                      value={formData.priority}
                      onChange={(value) => handleInputChange('priority', value)}
                      options={masterData.priority?.map(item => ({
                        value: item.id,
                        label: item.name
                      })) || []}
                      placeholder="Select priority"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Severity *
                    </label>
                    <Select
                      value={formData.severity}
                      onChange={(value) => handleInputChange('severity', value)}
                      options={masterData.severity?.map(item => ({
                        value: item.id,
                        label: item.name
                      })) || []}
                      placeholder="Select severity"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Additional Information */}
              <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Additional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Department *
                    </label>
                    <Select
                      value={formData.department}
                      onChange={(value) => handleInputChange('department', value)}
                      options={masterData.department?.map(item => ({
                        value: item.id,
                        label: item.name
                      })) || []}
                      placeholder="Select department"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                      Urgency
                    </label>
                    <Input
                      placeholder="How urgent is this issue?"
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                    Business Impact
                  </label>
                  <textarea
                    placeholder="How does this issue affect your work or business operations?"
                    value={formData.impact}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('impact', e.target.value)}
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="gap-2 min-w-[140px]"
                >
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
