"use client";

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Plus,
  X,
  MessageSquare,
  History,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  User as UserIcon,
  Clock
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const incidents = [
  { id: 'INC-2024-001', title: 'Global VPN Outage', status: 'In Progress', priority: 'Critical', caller: 'John Doe', assigned: 'Alice Smith', date: '2024-05-01' },
  { id: 'INC-2024-002', title: 'Printers offline - Level 4', status: 'New', priority: 'Medium', caller: 'Sarah Lee', assigned: 'Unassigned', date: '2024-05-02' },
  { id: 'INC-2024-003', title: 'Teams login error', status: 'Resolved', priority: 'Low', caller: 'Mike Ross', assigned: 'Bob Johnson', date: '2024-05-02' },
  { id: 'INC-2024-004', title: 'Laptop screen flickering', status: 'In Progress', priority: 'High', caller: 'Emma Wilson', assigned: 'Alice Smith', date: '2024-05-03' },
  { id: 'INC-2024-005', title: 'Slow database queries', status: 'New', priority: 'High', caller: 'David Chen', assigned: 'Unassigned', date: '2024-05-03' },
  { id: 'INC-2024-006', title: 'Access request: SAP', status: 'Closed', priority: 'Low', caller: 'Rachel Zane', assigned: 'Bob Johnson', date: '2024-05-04' },
];

export default function IncidentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc =>
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed': return 'success';
      case 'In Progress': return 'info';
      case 'New': return 'warning';
      default: return 'secondary';
    }
  };

  const handleResolve = (id: string) => {
    toast(`Incident ${id} has been resolved.`, "success");
    setSelectedIncident(null);
  };

  const handleExport = () => {
    toast("Exporting incident logs to CSV...", "info");
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="info" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">Service Desk</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Incident Records</h1>
          <p className="text-muted-foreground font-medium text-lg">Manage and track system-wide service disruptions.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleExport} className="h-12 rounded-2xl px-6 gap-2 border-2 font-black text-xs uppercase tracking-widest bg-background/50 backdrop-blur-xl">
            <Download className="w-4 h-4" /> EXPORT LOGS
          </Button>
          <Button className="h-12 rounded-2xl px-6 gap-2 shadow-2xl shadow-primary/20 font-black text-xs uppercase tracking-widest">
            <Plus className="w-4 h-4" /> NEW INCIDENT
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 border-b border-border/50 bg-muted/10">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by reference ID or title..."
                className="pl-12 h-14 rounded-2xl bg-background/50 border-none shadow-inner focus-visible:ring-primary/20 text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map(p => (
                <button
                  key={p}
                  className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 border-border/50 text-muted-foreground hover:border-primary/30"
                >
                  {p}
                </button>
              ))}
              <div className="w-px h-8 bg-border mx-2" />
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-secondary/50">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/50 bg-muted/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Issue Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Current Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Engineer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {filteredIncidents.map((inc) => (
                  <motion.tr
                    layout
                    key={inc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-primary/[0.03] transition-colors group cursor-pointer"
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-mono font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                        {inc.id}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-base font-bold mb-0.5 group-hover:text-primary transition-colors">{inc.title}</p>
                      <p className="text-xs text-muted-foreground font-medium">Caller: {inc.caller} • {inc.date}</p>
                    </td>
                    <td className="px-8 py-6">
                      <Badge
                        variant={getPriorityColor(inc.priority) as any}
                        className="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider border-none shadow-sm"
                      >
                        {inc.priority}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={cn('w-2 h-2 rounded-full ring-4 ring-offset-2',
                          inc.status === 'In Progress' ? 'bg-blue-500 ring-blue-500/20' :
                            inc.status === 'Resolved' ? 'bg-emerald-500 ring-emerald-500/20' :
                              inc.status === 'New' ? 'bg-amber-500 ring-amber-500/20' : 'bg-gray-400 ring-gray-400/20'
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{inc.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors ring-1 ring-border group-hover:ring-primary/20">
                          {inc.assigned[0]}
                        </div>
                        <span className="text-sm font-bold">{inc.assigned}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {selectedIncident && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIncident(null)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-card border-l border-border z-[110] shadow-[0_0_100px_rgba(0,0,0,0.3)] p-12 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-2">
                  <Badge variant="info" className="px-3 py-1 rounded-lg font-mono font-black text-[10px] tracking-widest">{selectedIncident.id}</Badge>
                  <h2 className="text-4xl font-black tracking-tighter leading-none">{selectedIncident.title}</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedIncident(null)} className="h-14 w-14 rounded-2xl bg-secondary/50 hover:bg-secondary">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex gap-4 mb-10">
                <Badge variant={getPriorityColor(selectedIncident.priority) as any} className="px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border-none shadow-lg">
                  {selectedIncident.priority} Priority
                </Badge>
                <Badge variant={getStatusColor(selectedIncident.status) as any} className="px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border-none shadow-lg">
                  {selectedIncident.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Reporting User</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                      {selectedIncident.caller[0]}
                    </div>
                    <p className="font-bold text-lg">{selectedIncident.caller}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned Specialist</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-black">
                      {selectedIncident.assigned[0]}
                    </div>
                    <p className="font-bold text-lg">{selectedIncident.assigned}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-6 space-y-10 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <MessageSquare className="w-4 h-4" /> Description
                  </div>
                  <div className="text-lg leading-relaxed font-medium text-foreground/80 bg-secondary/30 p-8 rounded-[2rem] border border-border/50">
                    User reported that they are unable to connect to the VPN since this morning.
                    They are getting a "Server Timeout" error after entering their 2FA code.
                    Verified that the user has an active account and the correct client version.
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <History className="w-4 h-4" /> Activity History
                  </div>
                  <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/50">
                    {[
                      { user: 'Alice Smith', action: 'Investigating network logs', time: '10:15 AM' },
                      { user: 'System', action: 'Assigned to L2 Support', time: '09:45 AM' },
                      { user: 'Service Portal', action: 'Record created', time: '09:30 AM' },
                    ].map((act, i) => (
                      <div key={i} className="pl-10 relative group">
                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-card border-4 border-primary/20 flex items-center justify-center group-hover:border-primary transition-colors">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <p className="text-base font-bold">{act.action}</p>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{act.user} • {act.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-border flex gap-4">
                <Button onClick={() => handleResolve(selectedIncident.id)} className="flex-1 h-16 rounded-[1.5rem] font-black text-lg gap-3 shadow-2xl shadow-primary/20">
                  <CheckCircle className="w-6 h-6" /> RESOLVE NOW
                </Button>
                <Button variant="outline" className="flex-1 h-16 rounded-[1.5rem] font-black text-lg gap-3 border-2">
                  <UserIcon className="w-6 h-6" /> ASSIGN TO ME
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
