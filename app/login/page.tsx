"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Shield, AlertCircle, User, ShieldCheck, HardHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginAction } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';

type UserRole = 'user' | 'agent' | 'admin';

export default function LoginPage() {
  const [email, setEmail] = useState('user@evolveitsm.com');
  const [password, setPassword] = useState('password');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== 'password') {
      toast('Invalid credentials. Hint: use "password"', 'error');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('role', selectedRole);

    const result = await loginAction(formData);
    if (result?.error) {
      toast(result.error, 'error');
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { id: 'user', label: 'End User', icon: User, desc: 'Raise & track tickets' },
    { id: 'agent', label: 'Agent', icon: HardHat, desc: 'Manage your queue' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Full system control' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">EvolveITSM</h1>
        </div>

        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-2 p-10 text-center">
            <CardTitle className="text-3xl font-black tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-base font-medium">
              Select your role and sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selector */}
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id as UserRole);
                      setEmail(`${role.id}@evolveitsm.com`);
                      setPassword('password');
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 relative',
                      selectedRole === role.id
                        ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                        : 'border-border bg-card/50 hover:border-primary/30 text-muted-foreground'
                    )}
                  >
                    {selectedRole === role.id && (
                      <div className="absolute top-1 right-1">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}
                    <role.icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{role.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-12 rounded-xl bg-background/50 border-none shadow-inner"
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl bg-background/50 border-none shadow-inner"
                />
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/20" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                Demo Password: <span className="font-mono font-black text-foreground">password</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
