"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Shield, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginAction } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';
import { getCompanyOptions } from '@/lib/companies';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedCompany) {
      toast('Please select a company', 'error');
      setIsLoading(false);
      return;
    }

    if (!username) {
      toast('Please enter your username', 'error');
      setIsLoading(false);
      return;
    }

    if (password !== 'password') {
      toast('Invalid credentials. Hint: use "password"', 'error');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('company', selectedCompany);

    const result = await loginAction(formData);
    if (result?.error) {
      toast(result.error, 'error');
      setIsLoading(false);
    }
  };


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
              Select your company and sign in to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company
                  </label>
                  <Select
                    options={getCompanyOptions()}
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                    placeholder="Select your company"
                    className="w-full"
                  />
                </div>

                <Input
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-12 rounded-xl bg-background/50 border-none shadow-inner"
                />

                <Input
                  id="password"
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
