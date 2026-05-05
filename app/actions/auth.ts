"use server";

import { createSession, deleteSession, UserRole } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getUserRole, getCompanyById } from '@/lib/companies';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const companyId = formData.get('company') as string;
  
  // Validate required fields
  if (!username || !password || !companyId) {
    return { error: 'Missing credentials' };
  }

  // Validate password (demo validation)
  if (password !== 'password') {
    return { error: 'Invalid password' };
  }

  // Get user role based on company and username
  const userInfo = getUserRole(companyId, username);
  if (!userInfo) {
    return { error: 'User not found in selected company' };
  }

  const { role, name } = userInfo;
  const company = getCompanyById(companyId);
  
  // Create email for the session
  const email = `${username}@${company?.name.toLowerCase().replace(/\s+/g, '')}.com`;

  // Create session with company information
  await createSession({
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    role,
    company: {
      id: companyId,
      name: company?.name || 'Unknown Company'
    }
  });

  return redirect(`/${role}`);
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
