import 'server-only';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'itsm_session';

export type UserRole = 'user' | 'agent' | 'admin';

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: {
    id: string;
    name: string;
  };
  language?: string;
  expiresAt: Date;
}

export async function createSession(user: { id: string, name: string, email: string, role: UserRole, company?: { id: string, name: string }, language?: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = JSON.stringify({ ...user, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;
  
  try {
    const payload = JSON.parse(session) as SessionPayload;
    if (payload && typeof payload.expiresAt === 'string') {
      return { ...payload, expiresAt: new Date(payload.expiresAt) };
    }
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
