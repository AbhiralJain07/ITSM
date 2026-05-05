"use client";

import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Edit3, 
  Camera,
  CheckCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/Providers';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleEditProfile = () => {
    toast("Opening profile editor...", "info");
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
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="relative h-64 rounded-[3rem] overflow-hidden group shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-accent opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000')] bg-cover bg-center mix-blend-overlay opacity-20" />
        
        <div className="absolute -bottom-1 left-12 flex items-end gap-8 pb-10">
          <div className="relative group/avatar">
            <div className="w-40 h-40 rounded-[2.5rem] bg-card border-[6px] border-background shadow-2xl flex items-center justify-center text-primary text-6xl font-black group-hover/avatar:scale-105 transition-transform duration-500">
              {user?.name?.[0]}
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/avatar:opacity-100">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4 space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tighter">{user?.name}</h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1 rounded-lg backdrop-blur-md font-black uppercase tracking-widest text-[10px]">
                {user?.role}
              </Badge>
              <span className="text-white/70 text-sm font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> San Francisco, HQ
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-8 right-12">
          <Button onClick={handleEditProfile} className="h-12 rounded-2xl px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-black uppercase tracking-widest text-xs gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="border-none bg-card/50 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-xl font-black tracking-tight border-b border-border/50 pb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</p>
                    <p className="font-bold text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Employee ID</p>
                    <p className="font-bold text-sm">EMP-2024-0{Math.floor(Math.random() * 900 + 100)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</p>
                    <p className="font-bold text-sm">Operations & Support</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined Date</p>
                    <p className="font-bold text-sm">January 12, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-[2.5rem] overflow-hidden relative">
            <CardContent className="p-8">
              <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
              <h4 className="text-xl font-black mb-2">Verified Enterprise Account</h4>
              <p className="text-sm font-medium opacity-80 leading-relaxed">
                Your account is protected by enterprise-grade security protocols and 2FA.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats & Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Impact Score</p>
                  <h3 className="text-4xl font-black tracking-tighter">98.4%</h3>
                </div>
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <CheckCircle className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Response Time</p>
                  <h3 className="text-4xl font-black tracking-tighter">1.8h</h3>
                </div>
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Clock className="w-7 h-7" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none bg-card/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">Recent Activity Log</h3>
                <Button variant="ghost" className="font-black text-xs uppercase tracking-widest text-primary">View Full History</Button>
              </div>

              <div className="space-y-8 relative">
                {[
                  { title: 'Authorized System Update', time: '2 hours ago', type: 'system' },
                  { title: 'Approved New User: John K.', time: '5 hours ago', type: 'admin' },
                  { title: 'Modified Global SLA Thresholds', time: '1 day ago', type: 'config' },
                  { title: 'Verified Data Center Migration', time: '2 days ago', type: 'system' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-6 relative group">
                    {i !== 3 && <div className="absolute left-[11px] top-6 bottom-[-32px] w-px bg-border/50" />}
                    <div className="w-6 h-6 rounded-full bg-primary/20 border-4 border-card flex-shrink-0 z-10 group-hover:bg-primary transition-colors" />
                    <div>
                      <p className="font-bold text-base leading-none mb-1.5 group-hover:text-primary transition-colors">{act.title}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
