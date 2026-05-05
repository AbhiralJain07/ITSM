"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Filter, 
  Download,
  MoreHorizontal,
  User,
  ExternalLink,
  Timer,
  Search,
  ChevronDown,
  ArrowUpRight,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const SLATimer: React.FC<{ initialSeconds: number }> = ({ initialSeconds }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  
  useEffect(() => {
    const timer = setInterval(() => setSeconds(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const hours = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return hours > 0 
      ? `${hours}h ${mins}m` 
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLow = seconds < 600; // 10 mins

  return (
    <div className={cn('flex items-center gap-1.5 font-mono text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm transition-colors', 
      isLow ? 'text-destructive bg-destructive/10 border-destructive/20 animate-pulse' : 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
    )}>
      <Timer className="w-3 h-3" />
      {formatTime(seconds)}
    </div>
  );
};

export default function AgentDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  
  const initialQueue = [
    { id: 'INC-2024-001', title: 'Critical Server Failure', priority: 'Critical', status: 'In Progress', caller: 'Internal Systems', sla: 420 },
    { id: 'INC-2024-004', title: 'VPN connection dropping', priority: 'High', status: 'In Progress', caller: 'Sarah Jenkins', sla: 1800 },
    { id: 'REQ-1092', title: 'Access Request: ERP System', priority: 'Medium', status: 'New', caller: 'Mike Ross', sla: 3600 },
    { id: 'INC-2024-008', title: 'Outlook sync issues', priority: 'Low', status: 'On Hold', caller: 'Emma White', sla: 7200 },
    { id: 'INC-2024-012', title: 'Teams screen sharing lag', priority: 'High', status: 'New', caller: 'David Beckham', sla: 1200 },
  ];

  const [myQueue, setMyQueue] = useState(initialQueue);

  const filteredQueue = useMemo(() => {
    return myQueue.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter ? ticket.priority === priorityFilter : true;
      return matchesSearch && matchesPriority;
    });
  }, [myQueue, searchTerm, priorityFilter]);

  const handlePickUp = () => {
    toast("Picked up next ticket: INC-2024-015", "success");
  };

  const handleAssignToMe = (id: string) => {
    toast(`Ticket ${id} assigned to you.`, "success");
  };

  const handleViewTicket = (id: string) => {
    toast(`Opening details for ${id}...`, "info");
  };

  const handleMoreActions = () => {
    toast("Additional management options coming soon.", "info");
  };

  const handleViewTeam = () => {
    toast("Loading complete team presence...", "info");
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="info" className="px-3 py-0.5 rounded-lg font-black tracking-widest text-[10px] uppercase">Agent Command Center</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">My Workspace</h1>
          <p className="text-muted-foreground font-medium text-lg">Focus on {filteredQueue.length} tickets requiring attention.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search queue..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          <Button onClick={handlePickUp} className="h-12 rounded-2xl px-6 gap-3 shadow-2xl shadow-primary/20 font-black">
            <Zap className="w-5 h-5 fill-current" /> PICK UP NEXT
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'My Active', value: '12', color: 'bg-blue-500', icon: User, trend: '+2' },
          { label: 'Critical', value: '4', color: 'bg-destructive', icon: AlertTriangle, trend: 'High' },
          { label: 'Resolved Today', value: '18', color: 'bg-emerald-500', icon: CheckCircle, trend: '+12%' },
          { label: 'SLA At Risk', value: '2', color: 'bg-amber-500', icon: Clock, trend: 'Warning' },
        ].map((item, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-xl shadow-lg hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden">
            <CardContent className="p-6 flex items-center gap-5 relative">
              <div className={cn("absolute top-0 right-0 w-20 h-20 opacity-5 rounded-full -mr-6 -mt-6", item.color)} />
              <div className={cn('p-4 rounded-[1.25rem] text-white shadow-lg', item.color)}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
                  <span className="text-[9px] font-bold text-emerald-500">{item.trend}</span>
                </div>
                <p className="text-3xl font-black tracking-tighter">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Main Work Table */}
        <Card className="xl:col-span-9 border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">Assigned Queue</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Prioritized by SLA and severity</p>
            </div>
            <div className="flex gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPriorityFilter(priorityFilter === p ? null : p)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                    priorityFilter === p ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-transparent border-border/50 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Incident Title</th>
                    <th className="px-8 py-5 text-[10px) font-black uppercase tracking-widest text-muted-foreground">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLA Remaining</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <AnimatePresence mode="popLayout">
                    {filteredQueue.map((ticket) => (
                      <motion.tr 
                        layout
                        key={ticket.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-primary/[0.03] transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-6">
                          <span className="text-sm font-mono font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                            {ticket.id}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-base font-bold mb-0.5 group-hover:text-primary transition-colors">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground font-medium">User: {ticket.caller}</p>
                        </td>
                        <td className="px-8 py-6">
                          <Badge 
                            variant={ticket.priority === 'Critical' ? 'destructive' : ticket.priority === 'High' ? 'warning' : 'secondary'} 
                            className="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider shadow-sm border-none"
                          >
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-center gap-1.5">
                             <div className={cn('w-2 h-2 rounded-full ring-4 ring-offset-2', 
                                ticket.status === 'In Progress' ? 'bg-blue-500 ring-blue-500/20' : 
                                ticket.status === 'New' ? 'bg-emerald-500 ring-emerald-500/20' : 'bg-gray-400 ring-gray-400/20'
                             )} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{ticket.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <SLATimer initialSeconds={ticket.sla} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button onClick={() => handleViewTicket(ticket.id)} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button onClick={handleMoreActions} variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar: Smart Panels */}
        <div className="xl:col-span-3 space-y-8">
          <Card className="border-none shadow-xl bg-destructive/5 rounded-[2.5rem] overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive/50" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-3 text-destructive uppercase tracking-widest">
                <AlertTriangle className="w-5 h-5" /> At Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {[1, 2].map((i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.02 }}
                  className="bg-card p-5 rounded-3xl border border-destructive/10 shadow-lg flex flex-col gap-3 relative overflow-hidden group/item"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black font-mono text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">INC-902{i}</span>
                    <Badge variant="destructive" className="h-4 text-[8px] px-1.5 font-black">CRITICAL</Badge>
                  </div>
                  <p className="text-sm font-bold leading-tight">SQL Cluster: Database Mirroring Timeout</p>
                  <Button onClick={() => handleAssignToMe(`INC-902${i}`)} size="sm" variant="danger" className="h-10 rounded-xl font-black text-[10px] w-full shadow-lg shadow-destructive/20">
                    ASSIGN TO ME
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" /> Live Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {[
                { user: 'Bob Wilson', action: 'resolved INC-201', time: '5m', status: 'Online' },
                { user: 'Alice Smith', action: 'added internal note', time: '12m', status: 'Online' },
                { user: 'Charlie Day', action: 'on break', time: '30m', status: 'Away' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-black text-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {act.user[0]}
                    </div>
                    <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card", act.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500')} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-foreground leading-tight">{act.user}</p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{act.action}</p>
                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{act.time} ago</p>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-8 pt-0">
               <Button onClick={handleViewTeam} variant="outline" className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2">VIEW FULL TEAM</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
