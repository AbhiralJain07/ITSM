import { fetchExternalLanguages } from './external-api';

export interface Language {
  culture: string;
  displayName: string;
  isCurrent: boolean;
  isDefault: boolean;
}

export interface I18nConfig {
  currentCulture: string;
  currentUiCulture: string;
  defaultCulture: string;
  supportedLanguages: Language[];
}

// Default fallback languages
export const DEFAULT_SUPPORTED_LANGUAGES: Language[] = [
  {
    culture: 'nl-NL',
    displayName: 'Nederlands (Nederland)',
    isCurrent: false,
    isDefault: false
  },
  {
    culture: 'en-US',
    displayName: 'English (United States)',
    isCurrent: true,
    isDefault: true
  },
  {
    culture: 'fr-FR',
    displayName: 'français (France)',
    isCurrent: false,
    isDefault: false
  },
  {
    culture: 'de-DE',
    displayName: 'Deutsch (Deutschland)',
    isCurrent: false,
    isDefault: false
  }
];

// Dynamic languages that will be fetched from external API
let SUPPORTED_LANGUAGES: Language[] = DEFAULT_SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE = 'en-US';

// Function to update supported languages from external API
export async function updateSupportedLanguages(): Promise<void> {
  try {
    const externalLanguages = await fetchExternalLanguages();
    SUPPORTED_LANGUAGES = externalLanguages;
    console.log('Successfully loaded languages:', externalLanguages.map(l => l.displayName).join(', '));
  } catch (error) {
    console.error('Failed to update supported languages from external API:', error);
    // Keep default languages if external API fails
    SUPPORTED_LANGUAGES = DEFAULT_SUPPORTED_LANGUAGES;
  }
}

// Getter for current supported languages
export function getSupportedLanguages(): Language[] {
  return SUPPORTED_LANGUAGES;
}

export const I18N_CONFIG: I18nConfig = {
  currentCulture: DEFAULT_LANGUAGE,
  currentUiCulture: DEFAULT_LANGUAGE,
  defaultCulture: DEFAULT_LANGUAGE,
  supportedLanguages: SUPPORTED_LANGUAGES
};

export type SupportedLanguage = 'en-US' | 'nl-NL' | 'fr-FR' | 'de-DE' | string;

export function getLanguageByCulture(culture: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.culture === culture);
}

export function isLanguageSupported(culture: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.culture === culture);
}
