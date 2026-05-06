"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { EnhancedLanguageSelector } from '@/components/ui/LanguageSelector';
import { Shield, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginAction } from '@/app/actions/auth';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { getCompanyOptions } from '@/lib/companies';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<Array<{value: string, label: string}>>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const { toast } = useToast();
  const { t, isLanguageLoading, currentLanguage } = useLanguage();

  // Load company options on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        console.log('Loading company options...');
        const options = await getCompanyOptions();
        console.log('Company options loaded:', options);
        setCompanyOptions(options);
      } catch (error) {
        console.error('Failed to load company options:', error);
        // Use fallback companies if API fails
        const fallbackOptions = [
          { value: 'wenodo', label: 'wenodo' }
        ];
        setCompanyOptions(fallbackOptions);
        toast('Using fallback companies', 'error');
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedCompany) {
      toast(t('auth.selectCompanyError'), 'error');
      setIsLoading(false);
      return;
    }

    if (!username) {
      toast(t('auth.enterUsername'), 'error');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Login attempt with external API:', { username, company: selectedCompany });
      
      // Call production external API
      const loginResponse = await fetch('https://localhost:5001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          realmName: selectedCompany,
          userName: username,
          password: password
        })
      });
      
      if (loginResponse.ok) {
        // Handle both JSON and text/plain responses
        let loginData;
        const contentType = loginResponse.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          loginData = await loginResponse.json();
        } else {
          // For text/plain response, try to parse as JSON
          const text = await loginResponse.text();
          try {
            loginData = JSON.parse(text);
          } catch {
            console.error('Invalid response format from production API');
            toast('Invalid API response format', 'error');
            return;
          }
        }
        
        console.log('Production API login successful:', loginData);
        
        // Extract user data from production API response
        const userData = loginData.elements || loginData;
        
        // Create session with production API data
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userData?.tenantInternalId || `${selectedCompany}-${username}`,
            name: userData?.displayName || username,
            email: userData?.email || `${username}@${selectedCompany}.com`,
            role: 'admin',
            company: {
              id: selectedCompany,
              name: selectedCompany
            },
            language: currentLanguage
          })
        });
        
        if (sessionResponse.ok) {
          console.log('Session created with production API data, redirecting...');
          // Store the access token from production API
          if (loginData.elements?.accessToken) {
            // Store token in session storage for profile API calls
            sessionStorage.setItem('accessToken', loginData.elements.accessToken);
            console.log('Access token stored for profile API');
          }
          window.location.href = '/admin';
        } else {
          toast('Session creation failed', 'error');
        }
      } else {
        const errorText = await loginResponse.text();
        console.error('Production API error:', errorText);
        toast('Invalid credentials or API error', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/20">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">EvolveITSM</h1>
          </div>
          <div className="flex items-center justify-center w-full">
            <EnhancedLanguageSelector />
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-2 p-10 text-center">
            <CardTitle className="text-3xl font-black tracking-tight">{t('auth.welcomeBack')}</CardTitle>
            <CardDescription className="text-base font-medium">
              {t('auth.welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('auth.company')}
                  </label>
                  <Select
                    options={companyOptions}
                    value={selectedCompany}
                    onChange={setSelectedCompany}
                    placeholder={isLoadingCompanies ? 'Loading companies...' : t('auth.selectCompany')}
                    className="w-full"
                    disabled={isLoadingCompanies}
                  />
                </div>

                <Input
                  id="username"
                  label={t('auth.username')}
                  type="text"
                  placeholder={t('auth.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="h-12 rounded-xl bg-background/50 border-none shadow-inner"
                />

                <Input
                  id="password"
                  label={t('auth.password')}
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl bg-background/50 border-none shadow-inner"
                />
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/20" isLoading={isLoading || isLanguageLoading}>
                {t('auth.signIn')}
              </Button>
            </form>

            <div className="pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                {t('auth.demoPassword')}: <span className="font-mono font-black text-foreground">password</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
