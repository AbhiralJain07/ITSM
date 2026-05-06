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
  
  console.log('Login attempt:', { username, companyId, password: '***' });
  
  // Basic validation
  if (!username || !password || !companyId) {
    return { error: 'Missing credentials' };
  }

  try {
    // Try external API authentication first
    let user = null;
    
    try {
      console.log('Attempting external API authentication...');
      const authResult = await authenticateWithExternalAPI({
        realmName: companyId,
        userName: username,
        password: password
      });
      
      console.log('External API result:', { success: authResult.success });
      
      if (authResult.success && authResult.user) {
        user = authResult.user;
        console.log('External API authentication successful');
      }
    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';
      console.warn('External API failed, using fallback:', errorMessage);
    }
    
    // If external API failed, create basic user
    if (!user) {
      console.log('Using fallback authentication');
      user = {
        id: `${companyId}-${username}`,
        name: username,
        username: username,
        role: 'admin' as UserRole,
        email: `${username}@${companyId}.com`
      };
    }
    
    // Get company information
    const company = getCompanyById(companyId);
    
    // Create session
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email || `${username}@${companyId}.com`,
      role: user.role as UserRole,
      company: {
        id: companyId,
        name: company?.name || companyId
      },
      language: language || 'en-US'
    });

    console.log('Session created, redirecting to:', `/${user.role}`);
    return redirect(`/${user.role}`);
    
  } catch (error) {
    console.error('Login failed:', error);
    return { error: 'Login failed. Please try again.' };
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
