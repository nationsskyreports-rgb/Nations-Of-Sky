import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, sessionToken } from '@/lib/gate';

// Everyone who knows the shared password gets the same access.
export async function getCurrentUser() {
  const password = process.env.DASHBOARD_PASSWORD || '';
  if (!password) return null;

  const expected = await sessionToken(password);
  const current = cookies().get(SESSION_COOKIE)?.value;
  if (current !== expected) return null;

  return { id: null, name: 'Nations of Sky', role: 'admin' };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin() {
  return requireUser();
}
