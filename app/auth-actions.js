'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_DAYS, sessionToken } from '@/lib/gate';

export async function signIn(formData) {
  const password = process.env.DASHBOARD_PASSWORD || '';
  if (!password) return { error: 'The dashboard password is not set up yet.' };

  const given = String(formData.get('password') || '');
  if (given !== password) return { error: 'Wrong password.' };

  cookies().set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });

  return { ok: true };
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE);
  redirect('/');
}
