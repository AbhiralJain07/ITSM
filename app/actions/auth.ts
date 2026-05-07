"use server";

import { createSession, deleteSession, UserRole } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserRole, getCompanyById } from '@/lib/companies';
import { authenticateWithExternalAPI } from '@/lib/external-auth';
import { headers } from 'next/headers';

// Translation function for server-side
function getServerTranslation(key: string, locale: string = 'en-US'): string {
  const translations: Record<string, Record<string, string>> = {
    'en-US': {
      'auth.missingCredentials': 'Missing credentials',
      'auth.invalidPassword': 'Invalid password',
      'auth.userNotFound': 'User not found in selected company',
      'auth.invalidCredentials': 'Invalid credentials'
    },
    'nl-NL': {
      'auth.missingCredentials': 'Inloggegevens ontbreken',
      'auth.invalidPassword': 'Ongeldig wachtwoord',
      'auth.userNotFound': 'Gebruiker niet gevonden in geselecteerd bedrijf',
      'auth.invalidCredentials': 'Ongelige inloggegevens'
    },
    'fr-FR': {
      'auth.missingCredentials': 'Identifiants manquants',
      'auth.invalidPassword': 'Mot de passe invalide',
      'auth.userNotFound': 'Utilisateur non trouvé dans l\'entreprise sélectionnée',
      'auth.invalidCredentials': 'Identifiants invalides'
    },
    'de-DE': {
      'auth.missingCredentials': 'Anmeldeinformationen fehlen',
      'auth.invalidPassword': 'Ungültiges Passwort',
      'auth.userNotFound': 'Benutzer im ausgewählten Unternehmen nicht gefunden',
      'auth.invalidCredentials': 'Ungültige Anmeldeinformationen'
    }
  };
  
  return translations[locale]?.[key] || translations['en-US'][key] || key;
}

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const companyId = formData.get('company') as string;
  const language = formData.get('language') as string;
  
  console.log('Simple login attempt:', { username, companyId });
  
  // For now, skip external API and create a basic session
  try {
    // Basic validation
    if (!username || !password || !companyId) {
      return { error: 'Missing credentials' };
    }

    // Create basic session for testing
    await createSession({
      id: 'test-user',
      name: username,
      email: `${username}@${companyId}.com`,
      role: 'admin' as UserRole,
      company: {
        id: companyId,
        name: companyId
      },
      language: 'en-US'
    });

    console.log('Basic session created, redirecting to admin');
    return redirect('/admin');
    
  } catch (error) {
    console.error('Simple login error:', error);
    return { error: 'Login failed' };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
