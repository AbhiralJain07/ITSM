"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Ticket, 
  ClipboardList, 
  AlertTriangle, 
  RefreshCw, 
  BookOpen, 
  Settings, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Shield,
  Moon,
  Sun,
  Users,
  BarChart3,
  Zap,
  Info,
  Database
} from 'lucide-react';
import { useAuth } from '@/context/Providers';
import { logoutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CompactLanguageSelector } from '@/components/ui/LanguageSelector';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getNavItems = () => {
    const base = [{ label: 'Dashboard', icon: LayoutDashboard, path: `/${user?.role}` }];
    
    if (user?.role === 'admin') {
      return [
        ...base,
        { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
        { label: 'Master Data', icon: Database, path: '/admin/master-data' },
        { label: 'Manage Users', icon: Users, path: '/admin/members' },
        { label: 'System Settings', icon: Settings, path: '/admin/settings' },
      ];
    }
    
    if (user?.role === 'agent') {
      return [
        ...base,
        { label: 'My Queue', icon: Zap, path: '/agent/queue' },
        { label: 'All Incidents', icon: AlertTriangle, path: '/agent/incidents' },
        { label: 'Knowledge Base', icon: BookOpen, path: '/kb' },
      ];
    }

    return [
      ...base,
      { label: 'Create Ticket', icon: Ticket, path: '/user/create-ticket' },
      { label: 'My Tickets', icon: ClipboardList, path: '/user/tickets' },
      { label: 'Knowledge Base', icon: BookOpen, path: '/kb' },
    ];
  };

  const navItems = getNavItems();

  const isLinkActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  const notifications = [
    { id: 1, title: 'Critical Alert', message: 'Server Cluster A is down', time: '2m ago', type: 'alert' },
    { id: 2, title: 'New Comment', message: 'Alice commented on INC-102', time: '15m ago', type: 'info' },
    { id: 3, title: 'SLA Breach', message: 'INC-098 is nearing deadline', time: '1h ago', type: 'warning' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] left-[60%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 300 }}
        className="hidden lg:flex flex-col glass-panel transition-all duration-500 ease-in-out relative z-40 border-r border-border/50"
      >
        <div className="p-8 flex items-center gap-4 h-24 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] group transition-transform hover:scale-110 active:scale-95 cursor-pointer">
            <Zap className="w-7 h-7 text-white fill-white animate-pulse" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-xl font-black tracking-tighter text-gradient">EvolveITSM</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Company OS</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className={cn(
                'flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden',
                isLinkActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30 active:scale-95'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110', isLinkActive(item.path) ? 'animate-pulse' : '')} />
              {!isSidebarCollapsed && (
                <span className="font-bold tracking-tight whitespace-nowrap text-sm">{item.label}</span>
              )}
              {isLinkActive(item.path) && (
                <motion.div layoutId="activeNav" className="absolute left-0 w-1.5 h-6 bg-primary-foreground rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-border/50">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center gap-4 px-4 py-3 w-full text-muted-foreground hover:text-foreground transition-all rounded-2xl hover:bg-secondary group"
          >
            <div className={cn('p-1.5 rounded-lg bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors')}>
              <ChevronRight className={cn('w-4 h-4 transition-transform duration-500', !isSidebarCollapsed && 'rotate-180')} />
            </div>
            {!isSidebarCollapsed && <span className="text-xs font-black uppercase tracking-widest">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 border-b border-border bg-card/30 backdrop-blur-2xl sticky top-0 z-30 px-4 lg:px-10 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl bg-secondary/50" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            
            <div className="relative flex-1 hidden md:block" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search anything... (e.g. INC-102)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-secondary/30 hover:bg-secondary/50 border border-border/50 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-5">
            <div className="flex items-center gap-1.5 p-1 bg-secondary/30 rounded-2xl border border-border/50">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-xl hover:bg-background transition-all h-9 w-9">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              <div className="w-px h-6 bg-border/50" />
              
              <CompactLanguageSelector className="hover:bg-background rounded-xl transition-all" />
              
              <div className="relative" ref={notificationsRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn("rounded-xl hover:bg-background transition-all h-9 w-9 relative", isNotificationsOpen && "bg-background shadow-sm")}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card" />
                </Button>
                
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.9 }}
                      className="absolute right-0 mt-4 w-80 bg-card border border-border rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] z-50 overflow-hidden"
                    >
                      <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
                        <h3 className="font-bold">Notifications</h3>
                        <Badge variant="info">3 New</Badge>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-2">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 rounded-2xl hover:bg-secondary transition-all cursor-pointer group mb-1">
                            <div className="flex gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                n.type === 'alert' ? 'bg-destructive/10 text-destructive' : 
                                n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                              )}>
                                {n.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold leading-tight mb-1">{n.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-2 font-medium">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-border/50">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black leading-none bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{user?.name}</p>
                <Badge 
                  variant={user?.role === 'admin' ? 'destructive' : user?.role === 'agent' ? 'info' : 'secondary'} 
                  className="mt-1.5 text-[9px] uppercase tracking-[0.1em] h-5 px-2 font-black border-none shadow-sm"
                >
                  {user?.role}
                </Badge>
              </div>
              <div className="relative group">
                <button className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold border border-primary/20 shadow-lg shadow-primary/5 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                  <User className="w-6 h-6" />
                </button>
                <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-50 overflow-hidden">
                  <div className="p-2.5">
                    <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl hover:bg-secondary transition-all font-semibold">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl hover:bg-secondary transition-all font-semibold">
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                    <div className="h-px bg-border my-2" />
                    <button onClick={() => logoutAction()} className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-2xl hover:bg-destructive/10 text-destructive text-left transition-all font-black group/btn">
                      <div className="p-1.5 rounded-lg bg-destructive/10 group-hover/btn:bg-destructive group-hover/btn:text-destructive-foreground transition-colors">
                        <LogOut className="w-3.5 h-3.5" />
                      </div>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-muted/10 selection:bg-primary/10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
