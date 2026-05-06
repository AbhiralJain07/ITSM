"use client";

import { SupportedLanguage } from './i18n/config';

export interface ClientSession {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'agent' | 'admin';
  company?: {
    id: string;
    name: string;
  };
  language?: string;
  expiresAt: string;
}

export async function getClientSession(): Promise<ClientSession | null> {
  try {
    const response = await fetch('/api/auth/session');
    
    // Handle 401 Unauthorized gracefully - user is not logged in
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      console.warn('Session API returned non-OK status:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    // Don't log 401 errors as they're expected when user is not logged in
    if (error instanceof Error && !error.message.includes('401')) {
      console.warn('Failed to get client session:', error);
    }
    return null;
  }
}
