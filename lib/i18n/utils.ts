import { DEFAULT_LANGUAGE, SupportedLanguage } from './config';

export type TranslationKey = string;

export interface Translations {
  [key: string]: string | Translations;
}

let translations: Translations = {};
let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

export async function loadTranslations(language: SupportedLanguage): Promise<Translations> {
  try {
    const response = await fetch(`/api/i18n/locales/${language}`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading translations for ${language}:`, error);
    // Fallback to default language
    if (language !== DEFAULT_LANGUAGE) {
      return loadTranslations(DEFAULT_LANGUAGE);
    }
    return {};
  }
}

export async function setLanguage(language: SupportedLanguage): Promise<void> {
  if (language === currentLanguage) return;
  
  translations = await loadTranslations(language);
  currentLanguage = language;
  
  // Store preference in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-language', language);
  }
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function getTranslation(key: string, params?: Record<string, string>): string {
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
      result = result.replace(new RegExp(`\\{${param}\\}`, 'g'), replacement);
    });
    return result;
  }
  
  return value;
}

export function t(key: string, params?: Record<string, string>): string {
  return getTranslation(key, params);
}

export function initializeLanguage(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred-language') as SupportedLanguage;
      const language = stored || DEFAULT_LANGUAGE;
      setLanguage(language).then(resolve);
    } else {
      setLanguage(DEFAULT_LANGUAGE).then(resolve);
    }
  });
}
