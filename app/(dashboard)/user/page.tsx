"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  MessageSquare,
  X,
  Send,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/Providers';
import { useToast } from '@/context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'Software' });

  const myTickets = [
    { id: 'INC-1002', title: 'Cannot access shared drive', status: 'In Progress', updated: '2 hours ago' },
    { id: 'REQ-5041', title: 'Adobe Creative Cloud license', status: 'Pending', updated: '5 hours ago' },
    { id: 'INC-0982', title: 'Slow internet in office', status: 'Resolved', updated: '1 day ago' },
  ];

  const activities = [
    { id: 1, text: 'Ticket INC-1002 status changed to In Progress', time: '2h ago' },
    { id: 2, text: 'Agent Alice Smith added a comment to your ticket', time: '4h ago' },
    { id: 3, text: 'Your request for Adobe Creative Cloud was approved', time: '5h ago' },
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast(`Ticket "${newTicket.title}" created successfully!`, 'success');
    setIsModalOpen(false);
    setNewTicket({ title: '', description: '', category: 'Software' });
  };

  const handleBrowseGuides = () => {
    toast("Opening Enterprise Help Center...", "info");
  };

  const handleViewHistory = () => {
    toast("Loading ticket archive...", "info");
  };

  const handleClearNotifications = () => {
    toast("Activity feed cleared.", "success");
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
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Welcome Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden group shadow-2xl shadow-primary/5"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-1 uppercase tracking-widest font-black text-[10px]">Portal Home</Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
              Welcome back,<br />
              <span className="text-primary">{user?.name.split(' ')[0]}!</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-md font-medium leading-relaxed">
              Our support engineers are online and ready to help you with any technical needs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl h-16 px-8 gap-3 shadow-2xl shadow-primary/30 text-lg font-black hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" /> Raise an Issue
            </Button>
            <Link href="/user/tickets">
              <Button variant="outline" size="lg" className="rounded-2xl h-16 px-8 bg-background/50 backdrop-blur-xl border-2 text-lg font-bold w-full">
                Ticket History
              </Button>
            </Link>
            <Link href="/kb">
              <Button variant="outline" size="lg" className="rounded-2xl h-16 px-8 bg-background/50 backdrop-blur-xl border-2 text-lg font-bold w-full">
                Browse Guides
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Active Tickets', value: '2', icon: Clock, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
          { label: 'Resolved (Last 30d)', value: '14', icon: CheckCircle, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
          { label: 'Pending Feedback', value: '1', icon: MessageSquare, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-card/50 backdrop-blur-xl overflow-hidden group">
            <CardContent className="p-8 flex items-center justify-between relative">
              <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-8 -mt-8", stat.color)} />
              <div>
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black mt-1 tracking-tighter">{stat.value}</h3>
              </div>
              <div className={cn('p-4 rounded-2xl text-white shadow-xl', stat.color, stat.shadow)}>
                <stat.icon className="w-7 h-7" />
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* My Tickets */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Active Requests</h2>
              <p className="text-muted-foreground font-medium">Track your ongoing support interactions</p>
            </div>
            <Link href="/user/tickets">
              <Button variant="ghost" className="font-black text-primary hover:bg-primary/5 h-12 rounded-xl uppercase tracking-widest text-xs">VIEW FULL HISTORY</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {myTickets.map((ticket) => (
              <Card key={ticket.id} className="group cursor-pointer hover:border-primary/50 transition-all duration-300 border-border/50 bg-card/40 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 ring-1 ring-border group-hover:ring-primary/20">
                      <MessageSquare className="w-6 h-6 text-muted-foreground group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{ticket.title}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">{ticket.id}</span>
                        <span className="text-xs text-muted-foreground/60 font-medium italic">Updated {ticket.updated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <Badge 
                      variant={ticket.status === 'Resolved' ? 'success' : ticket.status === 'Pending' ? 'warning' : 'info'}
                      className="px-4 py-1.5 rounded-xl font-black tracking-wider uppercase text-[10px] shadow-sm"
                    >
                      {ticket.status}
                    </Badge>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="px-2">
            <h2 className="text-3xl font-black tracking-tight">Recent Activity</h2>
            <p className="text-muted-foreground font-medium">System & Agent updates</p>
          </div>
          <Card className="border-none shadow-2xl bg-card/30 backdrop-blur-xl rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 space-y-10 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />
              {activities.map((activity, i) => (
                <div key={activity.id} className="flex gap-5 relative group">
                  {i !== activities.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-30px] w-0.5 bg-border/50" />
                  )}
                  <div className="w-5 h-5 rounded-full bg-primary/20 border-4 border-card flex-shrink-0 z-10 group-hover:scale-125 group-hover:bg-primary transition-all duration-300" />
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">{activity.text}</p>
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{activity.time}</p>
                  </div>
                </div>
              ))}
              <Button onClick={handleClearNotifications} variant="outline" className="w-full h-12 rounded-2xl font-black border-2 hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-widest text-xs">
                CLEAR ALL NOTIFICATIONS
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-card border border-border rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] z-[110] overflow-hidden"
            >
              <form onSubmit={handleCreateTicket} className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight">Raise an Issue</h2>
                    <p className="text-muted-foreground font-medium text-sm">Please provide details about your problem.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-2xl hover:bg-secondary">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Short Summary</label>
                    <Input 
                      placeholder="e.g. Cannot connect to Office printer" 
                      required
                      value={newTicket.title}
                      onChange={e => setNewTicket({...newTicket, title: e.target.value})}
                      className="h-14 rounded-2xl border-2 focus:border-primary/50 transition-all text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Category</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Software', 'Hardware', 'Network'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewTicket({...newTicket, category: cat})}
                          className={cn(
                            "py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all",
                            newTicket.category === cat ? "bg-primary border-primary text-white shadow-lg" : "bg-secondary border-transparent text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Description</label>
                    <textarea 
                      placeholder="Please describe what happened..."
                      required
                      value={newTicket.description}
                      onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                      className="w-full min-h-[150px] p-5 rounded-3xl bg-secondary/50 border-2 border-transparent focus:border-primary/50 focus:bg-card transition-all outline-none text-lg font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 gap-3"
                  >
                    <Send className="w-5 h-5" /> SUBMIT TICKET
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
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
