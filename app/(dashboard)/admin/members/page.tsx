"use client";

import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle, 
  Clock, 
  Shield, 
  Mail,
  UserPlus,
  X,
  User,
  AtSign,
  Briefcase,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/Providers';
import { useRouter } from 'next/navigation';

const demoUsers = [
  { 
    name: 'Alice Smith', 
    email: 'alice@evolveitsm.com', 
    role: 'Senior Agent', 
    solved: 142, 
    pending: 5, 
    unsolvedList: ['INC-102: VPN issues', 'INC-105: Printer offline'],
    status: 'Online',
    image: 'A'
  },
  { 
    name: 'Bob Johnson', 
    email: 'bob@evolveitsm.com', 
    role: 'Agent', 
    solved: 98, 
    pending: 12, 
    unsolvedList: ['INC-110: Outlook crash', 'REQ-052: Access grant'],
    status: 'Away',
    image: 'B'
  },
  { 
    name: 'Charlie Davis', 
    email: 'charlie@evolveitsm.com', 
    role: 'Support Lead', 
    solved: 256, 
    pending: 3, 
    unsolvedList: ['INC-001: Server outage'],
    status: 'Online',
    image: 'C'
  },
  { 
    name: 'Diana Prince', 
    email: 'diana@evolveitsm.com', 
    role: 'Agent', 
    solved: 115, 
    pending: 8, 
    unsolvedList: ['INC-122: Login loop'],
    status: 'Offline',
    image: 'D'
  },
];


export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user && user.role.toLowerCase() !== 'admin') {
      toast("Access denied: Admins only.", "error");
      router.push('/');
    }
  }, [user, router, toast]);

  const [users, setUsers] = useState(demoUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Agent', dept: 'Support' });

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userToAdd = {
      ...newUser,
      solved: 0,
      pending: 0,
      unsolvedList: [],
      status: 'Online',
      image: newUser.name.charAt(0).toUpperCase()
    };

    setUsers([userToAdd, ...users]);
    toast(`User "${newUser.name}" added to the team!`, "success");
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Agent', dept: 'Support' });
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
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">User Management</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Team Directory</h1>
          <p className="text-muted-foreground font-medium text-lg">Monitor team performance and manage global access.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          <Button onClick={handleAddUser} className="h-12 rounded-2xl px-6 gap-3 shadow-2xl shadow-primary/20 font-black">
            <UserPlus className="w-5 h-5" /> ADD MEMBER
          </Button>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Solved</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter">611</h2>
            <p className="mt-2 text-sm font-medium opacity-70">Accumulated across current team</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Workload</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter">28</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Open tickets requiring attention</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Team Efficiency</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-emerald-500">94.8%</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">SLA Compliance Average</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/5">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agent</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Role</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resolved</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Issues</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user, i) => (
                    <tr key={i} className="hover:bg-primary/[0.03] transition-all group">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-lg border border-primary/10 group-hover:scale-105 transition-transform">
                            {user.image}
                          </div>
                          <div>
                            <p className="font-bold text-lg leading-none mb-1.5">{user.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Mail className="w-3 h-3" /> {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <span className="text-xl font-black tabular-nums">{user.solved}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-xl font-black tabular-nums">{user.pending}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="space-y-2">
                          {user.unsolvedList.map((issue, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground bg-secondary/30 px-3 py-1 rounded-lg border border-border/50 w-fit">
                              <Shield className="w-3 h-3 text-destructive/70" /> {issue}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <Badge 
                          variant={user.status === 'Online' ? 'success' : user.status === 'Away' ? 'warning' : 'secondary'}
                          className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm"
                        >
                          {user.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Member Modal */}
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
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                      <UserPlus className="w-8 h-8 text-primary" /> New Member
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm">Onboard a new engineer or administrator.</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-2xl hover:bg-secondary">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="w-3 h-3" /> Full Name
                    </label>
                    <Input 
                      placeholder="e.g. John Doe" 
                      required
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="h-14 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary/20 text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <AtSign className="w-3 h-3" /> Email Address
                    </label>
                    <Input 
                      type="email"
                      placeholder="john@company.com" 
                      required
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="h-14 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary/20 text-lg font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Role
                      </label>
                      <select 
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                        className="w-full h-14 rounded-2xl bg-secondary/30 border-none px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                      >
                        <option>Agent</option>
                        <option>Senior Agent</option>
                        <option>Support Lead</option>
                        <option>Admin</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Layout className="w-3 h-3" /> Department
                      </label>
                      <select 
                        value={newUser.dept}
                        onChange={e => setNewUser({...newUser, dept: e.target.value})}
                        className="w-full h-14 rounded-2xl bg-secondary/30 border-none px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                      >
                        <option>Support</option>
                        <option>Infrastructure</option>
                        <option>Security</option>
                        <option>DevOps</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 gap-3"
                  >
                    ADD TO TEAM
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
