"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, getSupportedLanguages, updateSupportedLanguages } from '@/lib/i18n/config';
import { loadTranslations } from '@/lib/i18n/utils';
import { sendLanguageSelectionToExternalAPI } from '@/lib/i18n/external-api';
import type { Translations } from '@/lib/i18n/utils';
import { getClientSession } from '@/lib/client-session';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
  supportedLanguages: ReturnType<typeof getSupportedLanguages>;
  isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>('en-US');
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);
  const [translations, setTranslations] = useState<Translations>({});
  const [supportedLanguages, setSupportedLanguages] = useState(getSupportedLanguages());

  const handleSetLanguage = async (language: SupportedLanguage) => {
    setIsLanguageLoading(true);
    try {
      const newTranslations = await loadTranslations(language);
      setTranslations(newTranslations);
      setCurrentLanguageState(language);
      
      // Store preference in localStorage immediately
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', language);
      }
      
      // Send language selection to external API
      const cultureName = language.split('-')[0]; // Extract 'en', 'nl', 'fr', 'de', etc.
      const cultureDisplayNames: Record<string, string> = {
        'en': 'English',
        'nl': 'Dutch', 
        'fr': 'French',
        'de': 'German',
        // 'es': 'Spanish',
        'it': 'Italian'
      };
      
      const cultureDisplayName = cultureDisplayNames[cultureName] || cultureName;
      
      // Send to external API (don't wait for it to complete)
      sendLanguageSelectionToExternalAPI(cultureDisplayName).catch(error => {
        console.warn('External API call failed, but language was still changed:', error);
      });
      
      // Also try to update the session if user is logged in
      try {
        const response = await fetch('/api/auth/session', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language }),
        });
        
        if (response.ok) {
          console.log('Language updated in session');
        }
      } catch (sessionError) {
        console.warn('Could not update session language:', sessionError);
        // Don't fail the language switch if session update fails
      }
      
    } catch (error) {
      console.error('Failed to set language:', error);
    } finally {
      setIsLanguageLoading(false);
    }
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace parameters in translation
    if (params) {
      let result = value;
      Object.entries(params).forEach(([param, replacement]) => {
        result = result.replace(new RegExp(`\{${param}\}`, 'g'), replacement);
      });
      return result;
    }
    
    return value;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLanguageLoading(true);
        
        // First, fetch supported languages from external API
        await updateSupportedLanguages();
        setSupportedLanguages(getSupportedLanguages());
        
        let language: SupportedLanguage = 'en-US';
        
        // Try to get language from session (after login)
        const session = await getClientSession();
        if (session?.language) {
          language = session.language as SupportedLanguage;
        } else if (typeof window !== 'undefined') {
          // Fallback to localStorage (before login)
          const stored = localStorage.getItem('preferred-language') as SupportedLanguage;
          language = stored || 'en-US';
        }
        
        const initialTranslations = await loadTranslations(language);
        setTranslations(initialTranslations);
        setCurrentLanguageState(language);
        
        // Update localStorage with current language for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('preferred-language', language);
        }
      } catch (error) {
        console.error('Failed to initialize language:', error);
      } finally {
        setIsLanguageLoading(false);
      }
    };
    init();
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'preferred-language' && e.newValue) {
        const newLanguage = e.newValue as SupportedLanguage;
        if (newLanguage !== currentLanguage) {
          handleSetLanguage(newLanguage);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage: handleSetLanguage,
    t,
    supportedLanguages,
    isLanguageLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
