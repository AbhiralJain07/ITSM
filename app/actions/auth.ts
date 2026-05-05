"use server";

import { createSession, deleteSession, UserRole } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const usernameOrEmail = formData.get('email') as string;
  const role = formData.get('role') as UserRole;
  
  // Extract name and ensure a valid email format for the session
  const identifier = usernameOrEmail.split('@')[0];
  const name = identifier.charAt(0).toUpperCase() + identifier.slice(1);
  const finalEmail = usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail}@evolveitsm.com`;

  // Mock validation
  if (!usernameOrEmail || !role) return { error: 'Invalid credentials' };

  // Force correct demo names
  let finalName = name;
  if (role === 'user' && identifier.startsWith('user')) finalName = 'User';
  if (role === 'agent' && identifier.startsWith('agent')) finalName = 'Agent';
  if (role === 'admin' && identifier.startsWith('admin')) finalName = 'Admin';

  await createSession({
    id: Math.random().toString(36).substr(2, 9),
    name: finalName,
    email: finalEmail,
    role
  });

  return redirect(`/${role}`);
}

export async function logoutAction() {
  await deleteSession();
  redirect('/login');
}
