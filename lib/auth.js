import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { admin } from '@/lib/supabase-admin';

export async function getCurrentUser() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await admin()
    .from('profiles')
    .select('full_name, role, active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.active) return null;
  return {
    id: user.id,
    email: user.email,
    name: profile.full_name || user.email,
    role: profile.role,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?e=access');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}
