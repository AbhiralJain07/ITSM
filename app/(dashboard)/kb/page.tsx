"use client";

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Star, 
  Clock, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

const articles = [
  { id: 'KB-102', title: 'Resetting Enterprise SSO Credentials', category: 'Identity', views: '2.4k', time: '5m read', rating: 4.8 },
  { id: 'KB-205', title: 'VPN Troubleshooting: Connection Timeout', category: 'Network', views: '1.8k', time: '12m read', rating: 4.5 },
  { id: 'KB-301', title: 'Standard Laptop Onboarding SOP', category: 'Hardware', views: '950', time: '15m read', rating: 4.9 },
  { id: 'KB-088', title: 'Configuring Outlook for Mobile (O365)', category: 'Software', views: '3.2k', time: '8m read', rating: 4.7 },
  { id: 'KB-412', title: 'Reporting Security Vulnerabilities', category: 'Security', views: '540', time: '20m read', rating: 5.0 },
];

export default function KBPage() {
  const { toast } = useToast();

  const handleReadArticle = (title: string) => {
    toast(`Opening guide: ${title}`, "info");
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
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">Enterprise Repository</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Knowledge Base</h1>
          <p className="text-muted-foreground font-medium text-lg">Access verified solutions and standard operating procedures.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search guides and SOPs..." 
              className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl px-6 gap-2 border-2 font-black text-xs uppercase tracking-widest bg-card">
            <Filter className="w-4 h-4" /> CATEGORIES
          </Button>
        </div>
      </motion.div>

      {/* Featured Categories */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Infrastructure', count: 142, icon: Zap, color: 'text-amber-500' },
          { label: 'Cyber Security', count: 85, icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Access Mgmt', count: 210, icon: BookOpen, color: 'text-primary' },
          { label: 'SOPs & Policy', count: 64, icon: FileText, color: 'text-purple-500' },
        ].map((cat, i) => (
          <Card key={i} className="border-none bg-card/50 backdrop-blur-xl shadow-lg hover:translate-y-[-4px] transition-all duration-300 group cursor-pointer">
            <CardContent className="p-8 flex items-center gap-5">
              <div className={cn("p-4 rounded-2xl bg-secondary group-hover:scale-110 transition-transform", cat.color)}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{cat.label}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{cat.count} Articles</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Article List */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-border/50 bg-muted/5 flex flex-row items-center justify-between">
             <CardTitle className="text-2xl font-black tracking-tight">Recent Documentation</CardTitle>
             <Button variant="ghost" className="font-black text-xs uppercase tracking-widest text-primary">View All Guides</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {articles.map((art, i) => (
                <div key={i} onClick={() => handleReadArticle(art.title)} className="p-8 hover:bg-primary/[0.03] transition-all cursor-pointer group flex items-center justify-between">
                   <div className="flex gap-6 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center font-black text-muted-foreground text-xs group-hover:bg-primary group-hover:text-white transition-all">
                        {art.id}
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold group-hover:text-primary transition-colors">{art.title}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black text-muted-foreground uppercase bg-secondary/50 px-2 py-0.5 rounded-md">{art.category}</span>
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {art.time}
                          </span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> {art.rating}
                          </span>
                        </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs font-black text-muted-foreground">{art.views}</p>
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Views</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
