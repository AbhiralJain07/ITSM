"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  X,
  Mail,
  CheckCircle,
  Clock,
  Shield,
  Edit,
  Trash2,
  RefreshCw,
  User,
  AtSign,
  Briefcase,
  Layout,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/Providers';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/client-api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserItem {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  department?: { id: string; name: string } | null;
  roles?: { id: string; name: string }[];
}

interface Department {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}

const EMPTY_FORM = {
  userName: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  isActive: true,
  temporaryPassword: false,
  departmentIds: [] as string[],
  roleIds: [] as string[],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Access guard
  useEffect(() => {
    if (user && user.role.toLowerCase() !== 'admin') {
      toast('Access denied: Admins only.', 'error');
      router.push('/');
    }
  }, [user, router, toast]);

  // ─── State ──────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await apiGet<UserItem[]>('/api/users');
      if (result.success && result.data) setUsers(result.data);
      else toast(result.error || 'Failed to load users', 'error');
    } catch {
      toast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const result = await apiGet<Department[]>('/api/departments');
      if (result.success && result.data) setDepartments(result.data);
    } catch {}
  };

  const fetchRoles = async () => {
    try {
      const result = await apiGet<Role[]>('/api/roles');
      if (result.success && result.data) setRoles(result.data);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchRoles();
  }, []);

  // ─── CRUD ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEdit = (u: UserItem) => {
    setEditingUser(u);
    setForm({
      userName: u.userName,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      password: '',
      isActive: u.isActive,
      temporaryPassword: false,
      departmentIds: u.department ? [u.department.id] : [],
      roleIds: (u.roles || []).map(r => r.id),
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.userName.trim()) return toast('Username required', 'error');
    if (!form.email.trim()) return toast('Email required', 'error');
    if (!editingUser && !form.password.trim()) return toast('Password required', 'error');
    if (!editingUser && form.password.length < 8) return toast('Password must be at least 8 characters', 'error');

    setSubmitting(true);
    try {
      const isNew = !editingUser;
      const url = isNew ? '/api/users' : `/api/users/${editingUser!.id}`;
      const payload = isNew
        ? { ...form }
        : {
            userName: form.userName,
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            isActive: form.isActive,
            departmentIds: form.departmentIds,
            roleIds: form.roleIds,
          };

      const result = isNew ? await apiPost(url, payload) : await apiPut(url, payload);
      if (result.success) {
        toast(isNew ? 'User created successfully!' : 'User updated successfully!', 'success');
        setIsModalOpen(false);
        fetchUsers();
      } else {
        toast(result.error || 'Failed to save user', 'error');
      }
    } catch {
      toast('Failed to save user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const result = await apiDelete(`/api/users/${id}`);
      if (result.success) {
        toast('User deleted successfully!', 'success');
        fetchUsers();
      } else {
        toast(result.error || 'Failed to delete user', 'error');
      }
    } catch {
      toast('Failed to delete user', 'error');
    }
  };

  // ─── Filtered Data ───────────────────────────────────────────────

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.userName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge variant="secondary" className="px-3 py-1 rounded-lg font-black tracking-widest text-[10px] uppercase">
            User Management
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Team Directory</h1>
          <p className="text-muted-foreground font-medium text-lg">
            Monitor team performance and manage global access.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary/20"
            />
          </div>
          <Button variant="outline" onClick={fetchUsers} className="h-12 rounded-2xl px-4" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openCreate} className="h-12 rounded-2xl px-6 gap-3 shadow-2xl shadow-primary/20 font-black">
            <UserPlus className="w-5 h-5" /> ADD MEMBER
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/20 rounded-[2rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Members</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter">{users.length}</h2>
            <p className="mt-2 text-sm font-medium opacity-70">Registered in the system</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Users</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-emerald-500">
              {users.filter(u => u.isActive).length}
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Currently active accounts</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/50 backdrop-blur-xl shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Inactive Users</p>
            </div>
            <h2 className="text-5xl font-black tracking-tighter">
              {users.filter(u => !u.isActive).length}
            </h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Deactivated accounts</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 text-center text-muted-foreground">
                <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin opacity-40" />
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">No users found</p>
                <p className="text-sm mt-1">Try adjusting your search or add a new member</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/5">
                      {['Agent', 'Username', 'Department', 'Roles', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-primary/[0.03] transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-lg border border-primary/10 group-hover:scale-105 transition-transform">
                              {(u.firstName || u.userName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-base leading-none mb-1">
                                {u.firstName || ''} {u.lastName || ''}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Mail className="w-3 h-3" /> {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-mono text-muted-foreground">{u.userName}</span>
                        </td>
                        <td className="px-8 py-6">
                          {u.department ? (
                            <Badge variant="secondary" className="px-3 py-1 rounded-lg font-semibold text-xs">
                              {u.department.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap gap-1">
                            {(u.roles || []).length > 0 ? (
                              u.roles!.map(r => (
                                <Badge key={r.id} variant="outline" className="px-2 py-0.5 text-xs font-semibold">
                                  {r.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge
                            variant={u.isActive ? 'success' : 'secondary'}
                            className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest"
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="p-2">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} className="p-2 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal */}
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
              className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] overflow-y-auto bg-card border border-border rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] z-[110]"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                      <UserPlus className="w-8 h-8 text-primary" />
                      {editingUser ? 'Edit Member' : 'New Member'}
                    </h2>
                    <p className="text-muted-foreground font-medium text-sm">
                      {editingUser ? 'Update user information.' : 'Onboard a new team member.'}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-2xl hover:bg-secondary">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <User className="w-3 h-3" /> First Name
                      </label>
                      <Input
                        placeholder="John"
                        value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                        className="h-12 rounded-2xl bg-secondary/30 border-none"
                        disabled={!!editingUser}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <User className="w-3 h-3" /> Last Name
                      </label>
                      <Input
                        placeholder="Doe"
                        value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                        className="h-12 rounded-2xl bg-secondary/30 border-none"
                        
                      />
                    </div>
                  </div>

                  {/* Username & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <AtSign className="w-3 h-3" /> Username *
                      </label>
                      <Input
  placeholder="johndoe"
  value={form.userName}
  onChange={e => !editingUser && setForm(f => ({ ...f, userName: e.target.value }))}
  className={`h-12 rounded-2xl bg-secondary/30 border-none ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
  disabled={!!editingUser}
/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email *
                      </label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="h-12 rounded-2xl bg-secondary/30 border-none"
                      />
                    </div>
                  </div>

                  {/* Password — only for new user */}
                  {!editingUser && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Password * (min 8 chars)
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={form.password}
                          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          className="h-12 rounded-2xl bg-secondary/30 border-none pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer select-none mt-1">
                        <input
                          type="checkbox"
                          checked={form.temporaryPassword}
                          onChange={e => setForm(f => ({ ...f, temporaryPassword: e.target.checked }))}
                          className="rounded"
                        />
                        Temporary Password (user must change on first login)
                      </label>
                    </div>
                  )}

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Layout className="w-3 h-3" /> Department
                    </label>
                    <Select
                      options={[{ value: '', label: 'None' }, ...departments.map(d => ({ value: d.id, label: d.name }))]}
                      value={form.departmentIds[0] || ''}
                      onChange={val => setForm(f => ({ ...f, departmentIds: val ? [val] : [] }))}
                      placeholder="Select department"
                    />
                  </div>

                  {/* Roles */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Briefcase className="w-3 h-3" /> Roles
                    </label>
                    <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-secondary/20 min-h-[48px] border border-border/50">
                      {roles.map(r => {
                        const isSelected = form.roleIds.includes(r.id);
                        return (
                          <label 
                            key={r.id} 
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all duration-200",
                              isSelected 
                                ? "border-primary bg-primary/10 text-primary shadow-sm" 
                                : "border-border bg-card text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                setForm(f => ({
                                  ...f,
                                  roleIds: e.target.checked
                                    ? [...f.roleIds, r.id]
                                    : f.roleIds.filter(id => id !== r.id)
                                }));
                              }}
                              className="rounded accent-primary"
                            />
                            {r.name}
                          </label>
                        );
                      })}
                      {roles.length === 0 && (
                        <span className="text-muted-foreground text-sm">No roles available</span>
                      )}
                    </div>
                  </div>

                  {/* Active */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/15 border border-border/40">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Account Access</p>
                      <p className="text-xs text-muted-foreground font-medium">Enable or restrict system privileges</p>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                        className="rounded accent-primary h-4.5 w-4.5 cursor-pointer"
                      />
                      <span className="font-black text-xs uppercase tracking-widest">{form.isActive ? 'Active' : 'Inactive'}</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 h-14 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 gap-3"
                  >
                    <Save className="w-5 h-5" />
                    {submitting ? 'Saving...' : editingUser ? 'UPDATE MEMBER' : 'ADD TO TEAM'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="h-14 px-8 rounded-2xl font-bold border-2"
                  >
                    CANCEL
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}