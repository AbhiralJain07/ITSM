"use client";

import React, { useState } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const myUserTickets = [
  { id: 'INC-2024-001', title: 'Laptop screen flickering', priority: 'High', status: 'In Progress', agent: 'Alice Smith', lastUpdate: '2 hours ago' },
  { id: 'REQ-088', title: 'Adobe Creative Cloud License', priority: 'Medium', status: 'Approved', agent: 'Bob Johnson', lastUpdate: '1 day ago' },
  { id: 'INC-012', title: 'Unable to access shared drive', priority: 'Critical', status: 'Assigned', agent: 'Charlie Davis', lastUpdate: '15m ago' },
  { id: 'REQ-015', title: 'New Headset Request', priority: 'Low', status: 'Fulfilled', agent: 'Auto-Provision', lastUpdate: '3 days ago' },
];

export default function MyTicketsPage() {
  const { toast } = useToast();

  const handleDetails = (id: string) => {
    toast(`Opening ticket ${id} history...`, "info");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-[1600px] mx-auto"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">Personal Requests</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Support Tickets</h1>
          <p className="text-muted-foreground font-medium text-lg">Track and manage all your active and past requests.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search my tickets..." 
              className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-2 font-black text-xs uppercase tracking-widest bg-card">
            <Filter className="w-4 h-4" /> STATUS FILTER
          </Button>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Requests', value: '12', icon: FileText, color: 'text-primary' },
          { label: 'Active Issues', value: '3', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Resolved', value: '9', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Avg Rating', value: '4.9/5', icon: MessageSquare, color: 'text-purple-500' },
        ].map((card, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-secondary", card.color)}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{card.label}</p>
              <h2 className="text-4xl font-black tracking-tighter">{card.value}</h2>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Ticket List */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Request Details</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Agent</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {myUserTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-primary/[0.03] transition-colors group">
                      <td className="px-8 py-8">
                        <span className="text-sm font-mono font-black text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                          {ticket.id}
                        </span>
                      </td>
                      <td className="px-8 py-8">
                        <p className="text-base font-bold mb-1.5 group-hover:text-primary transition-colors">{ticket.title}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-3 h-3" /> Updated {ticket.lastUpdate}
                        </p>
                      </td>
                      <td className="px-8 py-8">
                        <Badge 
                          variant={ticket.status === 'Fulfilled' ? 'success' : ticket.status === 'Approved' ? 'info' : 'secondary'} 
                          className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-none shadow-sm"
                        >
                          {ticket.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center font-black text-xs text-muted-foreground">
                            {ticket.agent[0]}
                          </div>
                          <p className="text-sm font-bold">{ticket.agent}</p>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleDetails(ticket.id)} variant="outline" className="h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                            VIEW LOGS
                          </Button>
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-secondary">
                            <MoreHorizontal className="w-4 h-4" />
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
      </motion.div>
    </motion.div>
  );
}
