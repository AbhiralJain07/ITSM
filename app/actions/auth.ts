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
  
  console.log('Login attempt:', { username, companyId });
  
  try {
    // Basic validation
    if (!username || !password || !companyId) {
      return { error: getServerTranslation('auth.missingCredentials', language) };
    }

    // Authenticate with external API
    const authResult = await authenticateWithExternalAPI({
      realmName: companyId,
      userName: username,
      password: password
    });

    if (!authResult.success || !authResult.user) {
      return { error: authResult.error || getServerTranslation('auth.invalidCredentials', language) };
    }

    // Create session with external API user data
    await createSession({
      id: authResult.user.id,
      name: authResult.user.name,
      email: authResult.user.email || `${username}@${companyId}.com`,
      role: authResult.user.role as UserRole,
      company: {
        id: companyId,
        name: companyId
      },
      language: language || 'en-US'
    });

    console.log('Session created with external API, redirecting to', authResult.user.role);
    return redirect(`/${authResult.user.role}`);
    
  } catch (error) {
    console.error('Login error:', error);
    return { error: getServerTranslation('auth.invalidCredentials', language) };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
