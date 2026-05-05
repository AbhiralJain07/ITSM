"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  Activity,
  Settings,
  Download,
  ArrowUpRight,
  X,
  Shield,
  Save,
  Database,
  Globe,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const performanceData = [
  { name: 'Mon', tickets: 120, resolved: 110, uptime: 99.9 },
  { name: 'Tue', tickets: 150, resolved: 140, uptime: 99.8 },
  { name: 'Wed', tickets: 180, resolved: 160, uptime: 99.95 },
  { name: 'Thu', tickets: 140, resolved: 135, uptime: 100 },
  { name: 'Fri', tickets: 160, resolved: 155, uptime: 99.99 },
  { name: 'Sat', tickets: 60, resolved: 58, uptime: 100 },
  { name: 'Sun', tickets: 40, resolved: 38, uptime: 99.98 },
];

const categoryData = [
  { name: 'Hardware', value: 400 },
  { name: 'Software', value: 300 },
  { name: 'Network', value: 200 },
  { name: 'Security', value: 100 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReport = () => {
    toast("Generating enterprise-wide performance report...", "info");
    setTimeout(() => {
      toast("Report generated successfully and sent to your email.", "success");
    }, 2000);
  };

  const handleLeaderboard = () => {
    toast("Fetching real-time team leaderboard...", "info");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast("System configurations updated successfully!", "success");
    setIsSettingsOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">Infrastructure & Operations</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">System Overview</h1>
          <p className="text-muted-foreground font-medium text-lg">Real-time health monitoring and team performance analytics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/members">
            <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-2 font-black text-xs uppercase tracking-widest bg-background/50 backdrop-blur-xl">
              <Users className="w-4 h-4" /> MANAGE MEMBERS
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="h-12 rounded-2xl px-6 gap-2 border-2 font-black text-xs uppercase tracking-widest bg-background/50 backdrop-blur-xl">
            <Settings className="w-4 h-4" /> CONFIGURATION
          </Button>
          <Button onClick={handleReport} className="h-12 rounded-2xl px-6 gap-2 shadow-2xl shadow-primary/20 font-black text-xs uppercase tracking-widest">
            <Download className="w-4 h-4" /> GENERATE REPORT
          </Button>
        </div>
      </motion.div>

      {/* Analytics KPI Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Workforce', value: '2,840', trend: '+12%', icon: Users, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
          { label: 'SLA Compliance', value: '98.4%', trend: '+0.5%', icon: ShieldCheck, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Avg Resolution', value: '4.2h', trend: '-15%', icon: Clock, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
          { label: 'Infrastructure Health', value: '99.9%', trend: 'Stable', icon: Activity, color: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden">
            <CardContent className="p-8 relative">
              <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-8 -mt-8", stat.color)} />
              <div className="flex items-center justify-between mb-6">
                <div className={cn('p-4 rounded-2xl text-white shadow-xl', stat.color, stat.shadow)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={cn('text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest', 
                  stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 
                  stat.trend === 'Stable' ? 'bg-blue-500/10 text-blue-600' : 'bg-destructive/10 text-destructive'
                )}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black mt-1 tracking-tighter">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Resolution Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-8">
          <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Demand vs Resolution</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">Weekly incident inflow and resolution capacity</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm shadow-primary/40"/> CREATED
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/40"/> RESOLVED
                 </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="h-[400px] min-h-[400px] w-full" style={{ height: '400px' }}>
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} tickLine={false} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} tickLine={false} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="tickets" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorTickets)" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorResolved)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-muted/20 animate-pulse rounded-3xl" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <Card className="h-full border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black tracking-tight">Distribution</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Incident classification mix</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="h-[250px] min-h-[250px] w-full" style={{ height: '250px' }}>
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-muted/20 animate-pulse rounded-full" />
                )}
              </div>
              <div className="mt-8 space-y-4">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-secondary/50 p-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{cat.name}</span>
                    </div>
                    <span className="text-sm font-black font-mono">{(cat.value / 10).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Performance Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">Agent Performance</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Real-time team efficiency and workload distribution</p>
            </div>
            <Button variant="ghost" onClick={handleLeaderboard} className="font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/5 h-12 rounded-xl px-6">FULL LEADERBOARD</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agent Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Cycle</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">SLA Success</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Workload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    { name: 'Alice Smith', resolved: 142, avgTime: '3.2h', efficiency: '98.2%', status: 'Online' },
                    { name: 'Bob Johnson', resolved: 128, avgTime: '4.1h', efficiency: '94.5%', status: 'Away' },
                    { name: 'Charlie Davis', resolved: 95, avgTime: '3.8h', efficiency: '91.8%', status: 'Online' },
                    { name: 'Diana Prince', resolved: 156, avgTime: '2.9h', efficiency: '99.4%', status: 'Offline' },
                  ].map((agent, i) => (
                    <tr key={i} className="hover:bg-primary/[0.03] transition-colors group cursor-pointer">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-black text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {agent.name[0]}
                          </div>
                          <span className="font-bold text-base group-hover:text-primary transition-colors">{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-base font-black tracking-tight">{agent.resolved}</td>
                      <td className="px-8 py-6 text-sm font-bold text-muted-foreground">{agent.avgTime}</td>
                      <td className="px-8 py-6 text-sm font-black font-mono text-emerald-500">{agent.efficiency}</td>
                      <td className="px-8 py-6">
                        <Badge 
                          variant={agent.status === 'Online' ? 'success' : agent.status === 'Away' ? 'warning' : 'secondary'}
                          className="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider"
                        >
                          {agent.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-32 h-2.5 bg-secondary rounded-full overflow-hidden shadow-inner border border-border/50">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.random() * 60 + 20}%` }}
                               transition={{ duration: 1, delay: 0.5 }}
                               className={cn('h-full rounded-full shadow-lg', i % 2 === 0 ? 'bg-primary shadow-primary/20' : 'bg-amber-500 shadow-amber-500/20')} 
                             />
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground min-w-[30px]">ACT</span>
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
      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit bg-card border border-border rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] z-[110] overflow-hidden"
            >
              <form onSubmit={handleSaveSettings} className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                      <Settings className="w-8 h-8 text-primary" /> System Config
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm">Manage global enterprise settings and thresholds.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)} className="rounded-2xl hover:bg-secondary">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Database className="w-3 h-3" /> API Endpoint
                      </label>
                      <Input defaultValue="https://api.itsm-enterprise.com/v1" className="bg-secondary/50 border-none h-12 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="w-3 h-3" /> Region
                      </label>
                      <Input defaultValue="North America (East)" className="bg-secondary/50 border-none h-12 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Security Level
                      </label>
                      <Input defaultValue="Enterprise Grade (EAL4+)" className="bg-secondary/50 border-none h-12 rounded-xl font-bold" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Bell className="w-3 h-3" /> Notification SLA
                      </label>
                      <Input defaultValue="Instant (< 2s)" className="bg-secondary/50 border-none h-12 rounded-xl font-bold" />
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 gap-3"
                  >
                    <Save className="w-5 h-5" /> SAVE CONFIGURATION
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSettingsOpen(false)}
                    className="h-16 px-8 rounded-2xl font-bold border-2"
                  >
                    CANCEL
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
