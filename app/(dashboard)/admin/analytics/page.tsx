"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const trendData = [
  { name: 'Hardware', current: 120, previous: 80, trend: 'up' },
  { name: 'Software', current: 240, previous: 260, trend: 'down' },
  { name: 'Network', current: 180, previous: 110, trend: 'up' },
  { name: 'Security', current: 65, previous: 40, trend: 'up' },
  { name: 'Cloud', current: 95, previous: 105, trend: 'down' },
];

const performanceData = [
  { agent: 'Alice S.', resolved: 142, avgTime: '2.4h', csat: 4.9 },
  { agent: 'Charlie D.', resolved: 256, avgTime: '3.1h', csat: 4.8 },
  { agent: 'Bob J.', resolved: 98, avgTime: '4.5h', csat: 4.5 },
  { agent: 'Diana P.', resolved: 115, avgTime: '2.8h', csat: 4.7 },
  { agent: 'John K.', resolved: 88, avgTime: '3.5h', csat: 4.6 },
];

const resolutionTimeline = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 48 },
  { day: 'Thu', count: 61 },
  { day: 'Fri', count: 55 },
  { day: 'Sat', count: 32 },
  { day: 'Sun', count: 28 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleExport = () => {
    toast("Exporting deep analysis report (PDF)...", "info");
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
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">Business Intelligence</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Enterprise Analytics</h1>
          <p className="text-muted-foreground font-medium text-lg">Deep dive into operational efficiency and incident trends.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-2 font-black text-xs uppercase tracking-widest bg-background/50 backdrop-blur-xl">
            <Filter className="w-4 h-4" /> LAST 30 DAYS
          </Button>
          <Button onClick={handleExport} className="h-12 rounded-2xl px-6 gap-2 shadow-2xl shadow-primary/20 font-black text-xs uppercase tracking-widest">
            <Download className="w-4 h-4" /> EXPORT REPORT
          </Button>
        </div>
      </motion.div>

      {/* Global Analysis KPIs */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Avg Resolution Time', value: '3.2h', trend: '-12%', icon: Clock, color: 'text-emerald-500' },
          { label: 'Customer Satisfaction', value: '4.8/5', trend: '+0.4', icon: Zap, color: 'text-amber-500' },
          { label: 'SLA Breach Rate', value: '1.2%', trend: '-0.5%', icon: AlertCircle, color: 'text-destructive' },
          { label: 'Cost Per Ticket', value: '$24.50', trend: '-$2.10', icon: TrendingUp, color: 'text-primary' },
        ].map((kpi, i) => (
          <Card key={i} className="border-none glass-card rounded-[2rem]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-secondary/50", kpi.color)}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <div className={cn("text-[10px] font-black px-2 py-1 rounded-full", 
                  kpi.trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                )}>
                  {kpi.trend}
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
              <h2 className="text-4xl font-black tracking-tighter">{kpi.value}</h2>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Incident Type Trends */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black tracking-tight">Incident Type Volume</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Weekly comparison of problem categories</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="h-[400px] w-full" style={{ height: '400px' }}>
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
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
                        cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '16px', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="current" name="This Week" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                      <Bar dataKey="previous" name="Last Week" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-muted/20 animate-pulse rounded-3xl" />
                )}
              </div>
              <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-black text-xs uppercase tracking-widest">Key Insight</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  <span className="font-bold text-foreground">Network issues</span> have increased by <span className="text-destructive font-black">63%</span> this week, likely due to the scheduled data center maintenance. Software requests remain high but stable.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Member Performance Leaderboard */}
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <Card className="h-full border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black tracking-tight">Top Performers</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Agent productivity and quality metrics</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
                {performanceData.map((agent, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center font-black text-primary border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base leading-none mb-1">{agent.agent}</p>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-muted-foreground uppercase">{agent.resolved} Resolved</span>
                         <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                         <span className="text-[10px] font-black text-emerald-500 uppercase">{agent.csat} CSAT</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black tracking-tighter">{agent.avgTime}</p>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg Speed</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/5">
                VIEW DETAILED RANKINGS
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Resolution Volume Area Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-black tracking-tight">Resolution Efficiency</CardTitle>
            <p className="text-sm text-muted-foreground font-medium">Daily incident closure rates for the enterprise</p>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[300px] w-full" style={{ height: '300px' }}>
               {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={resolutionTimeline}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} tickLine={false} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                      />
                      <YAxis 
                        axisLine={false} tickLine={false} 
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '16px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-muted/20 animate-pulse rounded-3xl" />
                )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
