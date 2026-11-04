'use server';

import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase-admin';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { DEFAULT_SETTINGS, QUESTION_TYPES } from '@/lib/config';
import { randomSlug, randomToken, normalizePhone, getBaseUrl } from '@/lib/server-utils';

async function needUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');
  return user;
}

async function needAdmin() {
  const user = await needUser();
  if (user.role !== 'admin') throw new Error('Admins only');
  return user;
}

const text = (fd, key) => String(fd.get(key) || '').trim();

/* ---------- Branches ---------- */

export async function createBranch(formData) {
  await needAdmin();
  const name = text(formData, 'name');
  if (!name) return;
  for (let i = 0; i < 5; i++) {
    const { error } = await admin().from('branches').insert({ name, slug: randomSlug() });
    if (!error) break;
    if (error.code !== '23505') throw new Error(error.message);
  }
  revalidatePath('/dashboard/branches');
}

export async function updateBranch(formData) {
  await needAdmin();
  const id = text(formData, 'id');
  const name = text(formData, 'name');
  if (!id || !name) return;
  await admin()
    .from('branches')
    .update({ name, active: formData.get('active') === 'on' })
    .eq('id', id);
  revalidatePath('/dashboard/branches');
}

/* ---------- Questions ---------- */

export async function saveQuestion(formData) {
  await needAdmin();
  const db = admin();
  const id = text(formData, 'id');
  const label = text(formData, 'label');
  const type = text(formData, 'type');
  if (!label || !QUESTION_TYPES.some((t) => t.value === type)) return;

  const options = text(formData, 'options')
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean);

  const row = {
    label,
    type,
    options: type === 'choice' ? options : [],
    required: formData.get('required') === 'on',
    active: formData.get('active') === 'on',
  };

  if (id) {
    await db.from('questions').update(row).eq('id', id);
  } else {
    const { data } = await db
      .from('questions')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);
    row.sort_order = (data?.[0]?.sort_order || 0) + 1;
    row.active = true;
    await db.from('questions').insert(row);
  }
  revalidatePath('/dashboard/questions');
}

async function move(formData, dir) {
  await needAdmin();
  const db = admin();
  const id = text(formData, 'id');
  const { data } = await db.from('questions').select('id, sort_order').order('sort_order');
  const list = data || [];
  const i = list.findIndex((q) => q.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  for (let k = 0; k < list.length; k++) {
    await db.from('questions').update({ sort_order: k + 1 }).eq('id', list[k].id);
  }
  revalidatePath('/dashboard/questions');
}

export async function moveQuestionUp(formData) {
  await move(formData, -1);
}

export async function moveQuestionDown(formData) {
  await move(formData, 1);
}

export async function deleteQuestion(formData) {
  await needAdmin();
  await admin().from('questions').delete().eq('id', text(formData, 'id'));
  revalidatePath('/dashboard/questions');
}

/* ---------- Settings ---------- */

export async function saveSettings(formData) {
  await needAdmin();
  const rows = Object.keys(DEFAULT_SETTINGS).map((key) => ({ key, value: text(formData, key) }));
  await admin().from('settings').upsert(rows, { onConflict: 'key' });
  revalidatePath('/dashboard/settings');
}

/* ---------- Team ---------- */

export async function createUser(formData) {
  await needAdmin();
  const email = text(formData, 'email').toLowerCase();
  const password = String(formData.get('password') || '');
  const name = text(formData, 'name');
  const role = text(formData, 'role') === 'admin' ? 'admin' : 'staff';
  if (!email || password.length < 8) return;

  const db = admin();
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(error.message);
  await db.from('profiles').upsert({ id: data.user.id, full_name: name || email, role, active: true });
  revalidatePath('/dashboard/team');
}

export async function setUserActive(formData) {
  const me = await needAdmin();
  const id = text(formData, 'id');
  if (!id || id === me.id) return;
  await admin()
    .from('profiles')
    .update({ active: formData.get('active') === '1' })
    .eq('id', id);
  revalidatePath('/dashboard/team');
}

/* ---------- WhatsApp visit links ---------- */

export async function createVisit({ branchId, name, phone }) {
  const user = await needUser();
  const db = admin();
  const settings = await getSettings();

  const normalized = normalizePhone(phone, settings.default_country_code);
  if (!normalized) return { error: 'Enter a valid mobile number.' };

  const { data: branch } = await db.from('branches').select('id, name, active').eq('id', branchId).maybeSingle();
  if (!branch || !branch.active) return { error: 'Choose a branch.' };

  const customer = String(name || '').trim().slice(0, 120);
  const token = randomToken();
  const { error } = await db.from('visits').insert({
    token,
    branch_id: branch.id,
    customer_name: customer || null,
    customer_phone: normalized,
    staff_id: user.id,
    staff_name: user.name,
  });
  if (error) return { error: 'Could not create the link.' };

  const link = `${getBaseUrl()}/v/${token}`;
  const message = settings.whatsapp_message
    .replaceAll('{name}', customer || 'there')
    .replaceAll('{link}', link)
    .replaceAll('{staff}', user.name)
    .replaceAll('{branch}', branch.name);

  revalidatePath('/dashboard/send');
  return {
    link,
    phone: normalized,
    waUrl: `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`,
  };
}
