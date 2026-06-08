"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  Inbox,
  MessageSquare,
  BookOpen,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/Providers';
import { useToast } from '@/context/ToastContext';
import { apiGet } from '@/lib/client-api';

interface TicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  statusCode?: string;
  statusName?: string;
  priorityCode?: string;
  priorityName?: string;
  categoryName?: string;
  createdAt: string;
}

const FAQS = [
  {
    q: "How do I reset my secure VPN connection?",
    a: "Open the GlobalProtect or Cisco client on your system, click settings, and clear the connection cache. Restart your system and try authenticating with your Single Sign-On (SSO) credentials again."
  },
  {
    q: "Setting up Outlook account email synchronization",
    a: "Go to Outlook settings > Accounts > Email sync. Make sure your incoming mail server is set to the enterprise Exchange server and SSL is checked for both SMTP (587) and IMAP (993) protocols."
  },
  {
    q: "Connecting a new office printer",
    a: "Open System Preferences > Printers & Scanners on your Mac. Click the '+' sign, select IP Printer, type the printer's DNS name printed on the barcode tag, and select Generic PostScript Printer drivers."
  }
];

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const result = await apiGet<any>('/api/tickets?page=1&pageSize=50');
      if (result.success && result.data) {
        const data = result.data as any;
        const items = Array.isArray(data) ? data : data.items || [];
        setTickets(items);
      } else {
        toast(result.error || 'Failed to load support requests', 'error');
      }
    } catch {
      toast('Failed to load support requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const stats = React.useMemo(() => {
    const active = tickets.filter(t => !['resolved', 'closed'].some(k => t.statusCode?.toLowerCase().includes(k))).length;
    const resolved = tickets.filter(t => ['resolved', 'closed'].some(k => t.statusCode?.toLowerCase().includes(k))).length;
    return { active, resolved, total: tickets.length };
  }, [tickets]);

  // Determine current timeline progress index (0 to 3) based on statusCode
  const getProgressIndex = (code?: string) => {
    const status = code?.toLowerCase() || '';
    if (status.includes('resolved') || status.includes('closed')) return 3;
    if (status.includes('progress') || status.includes('hold')) return 2;
    if (status.includes('assigned')) return 1;
    return 0; // new / open
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-[1200px] mx-auto bg-dot-grid"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants} 
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white p-8 md:p-12 shadow-2xl shadow-primary/20"
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 space-y-4 max-w-2xl">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 font-bold rounded-lg uppercase tracking-wider text-[10px]">
            EvolveITSM Portal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
            Hello, {user?.name || 'User'}!
          </h1>
          <p className="text-white/80 font-medium text-lg leading-relaxed">
            Welcome to your IT support center. You can check ticket progress, submit new issues, or browse answers in the knowledge base.
          </p>
        </div>
      </motion.div>

      {/* Grid: Actions & Mini Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Large Actions */}
        <motion.div variants={itemVariants} className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card 
            onClick={() => router.push('/user/create-ticket')}
            className="cursor-pointer border-none shadow-xl bg-card/60 backdrop-blur-xl hover:translate-y-[-4px] hover:border-primary/20 hover:bg-card/85 transition-all duration-300 rounded-[2rem] group overflow-hidden"
          >
            <CardContent className="p-8 space-y-5">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit group-hover:scale-110 transition-transform shadow-inner">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1.5 group-hover:text-primary transition-colors flex items-center gap-2">
                  Create Support Ticket <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Submit a new request or report an incident to the IT support team.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => router.push('/kb')}
            className="cursor-pointer border-none shadow-xl bg-card/60 backdrop-blur-xl hover:translate-y-[-4px] hover:border-primary/20 hover:bg-card/85 transition-all duration-300 rounded-[2rem] group overflow-hidden"
          >
            <CardContent className="p-8 space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 w-fit group-hover:scale-110 transition-transform shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1.5 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                  Knowledge Base <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Explore self-service articles, tutorials, and frequently asked answers.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Stats Column */}
        <motion.div variants={itemVariants} className="md:col-span-4 grid grid-cols-2 gap-4">
          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl w-fit">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Active Requests</p>
                <h3 className="text-3xl font-black tracking-tighter">{loading ? '...' : stats.active}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl w-fit">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Resolved Issues</p>
                <h3 className="text-3xl font-black tracking-tighter">{loading ? '...' : stats.resolved}</h3>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent Tickets Timeline View */}
        <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Active Incident Tracks</h2>
              <p className="text-sm text-muted-foreground font-medium">Visual step milestones for your recent requests</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUserTickets} className="h-10 rounded-xl px-3 border-2" disabled={loading}>
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => router.push('/user/tickets')} variant="outline" className="h-10 rounded-xl font-bold gap-2">
                All Tickets <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-muted/30 rounded-[2rem] animate-pulse" />)}
            </div>
          ) : tickets.length === 0 ? (
            <Card className="border-none bg-card/40 backdrop-blur-xl rounded-[2rem] p-12 text-center text-muted-foreground">
              <Inbox className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No active tickets found</p>
              <p className="text-sm mt-1">Submit an incident above to monitor progress here.</p>
            </Card>
          ) : (
            tickets.slice(0, 3).map((t) => {
              const currentProgress = getProgressIndex(t.statusCode);
              const steps = ['Logged', 'Assigned', 'In Review', 'Resolved'];
              return (
                <Card key={t.id} onClick={() => router.push(`/user/tickets?id=${t.id}`)} className="cursor-pointer border-none bg-card/45 backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all rounded-[2rem] overflow-hidden group">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                          {t.ticketNumber}
                        </span>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors pr-2 line-clamp-1">{t.title}</h4>
                      </div>
                      <Badge className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary border-none">
                        {t.categoryName || 'General'}
                      </Badge>
                    </div>

                    {/* Stepper progress visual bar */}
                    <div className="pt-2 relative">
                      {/* Grey connector line background */}
                      <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-secondary/80 z-0" />
                      {/* Active primary connector line */}
                      <div 
                        className="absolute top-4 left-[10%] h-0.5 bg-primary z-0 transition-all duration-700" 
                        style={{ width: `${(currentProgress / 3) * 80}%` }}
                      />
                      
                      <div className="relative z-10 flex justify-between">
                        {steps.map((step, idx) => {
                          const isCompleted = idx <= currentProgress;
                          const isActive = idx === currentProgress;
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <div 
                                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isActive ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                                  isCompleted ? 'bg-primary/15 border-primary text-primary' : 'bg-card border-secondary text-muted-foreground'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-current" />
                                )}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground/60'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </motion.div>

        {/* Right Side: Collapsible FAQ widget */}
        <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
          <div className="pb-2">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Smart Solutions
            </h2>
            <p className="text-sm text-muted-foreground font-medium">Instant self-service answers to common inquiries</p>
          </div>

          <Card className="border-none shadow-xl bg-card/45 backdrop-blur-xl rounded-[2.5rem] p-6 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center gap-4 text-left font-bold text-sm text-foreground hover:text-primary transition-colors py-2 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-muted-foreground leading-relaxed pt-2 font-medium bg-secondary/20 p-4.5 rounded-2xl border border-border/10 mt-1">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </Card>
        </motion.div>

      </div>
    </motion.div>
  );
}