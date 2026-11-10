'use server';

import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase-admin';
import { getCurrentUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { DEFAULT_SETTINGS, QUESTION_TYPES } from '@/lib/config';
import { randomSlug, randomToken, normalizePhone, getBaseUrl } from '@/lib/server-utils';

async function needUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Your session has expired. Please sign in again.');
  return user;
}

async function needAdmin() {
  const user = await needUser();
  if (user.role !== 'admin') throw new Error('Only admins can do this.');
  return user;
}

const text = (fd, key) => String(fd.get(key) || '').trim();

function must(result) {
  if (result?.error) throw new Error(result.error.message);
  return result;
}

// Runs the work and returns { ok, message } or { ok: false, error } for the toast.
async function run(work) {
  try {
    const message = await work();
    return { ok: true, message };
  } catch (e) {
    return { ok: false, error: e?.message || 'Something went wrong.' };
  }
}

/* ---------- QR codes ---------- */

export async function createBranch(formData) {
  return run(async () => {
    await needAdmin();
    const name = text(formData, 'name');
    if (!name) throw new Error('Enter a name.');
    for (let i = 0; i < 5; i++) {
      const { error } = await admin().from('branches').insert({ name, slug: randomSlug() });
      if (!error) break;
      if (error.code !== '23505') throw new Error(error.message);
    }
    revalidatePath('/dashboard/branches');
    return 'QR code added';
  });
}

export async function updateBranch(formData) {
  return run(async () => {
    await needAdmin();
    const id = text(formData, 'id');
    const name = text(formData, 'name');
    if (!id || !name) throw new Error('Enter a name.');
    must(
      await admin()
        .from('branches')
        .update({ name, active: formData.get('active') === 'on' })
        .eq('id', id)
    );
    revalidatePath('/dashboard/branches');
    return 'QR code saved';
  });
}

/* ---------- Questions ---------- */

export async function questionAction(formData) {
  return run(async () => {
    await needAdmin();
    const db = admin();
    const intent = text(formData, 'intent') || 'save';
    const id = text(formData, 'id');

    if (intent === 'delete') {
      must(await db.from('questions').delete().eq('id', id));
      revalidatePath('/dashboard/questions');
      return 'Question deleted';
    }

    if (intent === 'up' || intent === 'down') {
      const { data } = must(await db.from('questions').select('id, sort_order').order('sort_order'));
      const list = data || [];
      const i = list.findIndex((q) => q.id === id);
      const j = i + (intent === 'up' ? -1 : 1);
      if (i < 0 || j < 0 || j >= list.length) return 'Order updated';
      [list[i], list[j]] = [list[j], list[i]];
      for (let k = 0; k < list.length; k++) {
        must(await db.from('questions').update({ sort_order: k + 1 }).eq('id', list[k].id));
      }
      revalidatePath('/dashboard/questions');
      return 'Order updated';
    }

    const label = text(formData, 'label');
    const type = text(formData, 'type');
    if (!label) throw new Error('Enter the question.');
    if (!QUESTION_TYPES.some((t) => t.value === type)) throw new Error('Choose a question type.');

    const lines = (key) =>
      text(formData, key)
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean);
    const options = lines('options');
    const optionsAr = lines('options_ar');
    if (type === 'choice' && options.length < 2) throw new Error('Add at least two choices, one per line.');
    if (type === 'choice' && optionsAr.length && optionsAr.length !== options.length)
      throw new Error('Arabic choices must match the English choices line by line.');

    const row = {
      label,
      label_ar: text(formData, 'label_ar'),
      type,
      options: type === 'choice' ? options : [],
      options_ar: type === 'choice' ? optionsAr : [],
      required: formData.get('required') === 'on',
      active: formData.get('active') === 'on',
    };

    if (id) {
      must(await db.from('questions').update(row).eq('id', id));
    } else {
      const { data } = must(
        await db.from('questions').select('sort_order').order('sort_order', { ascending: false }).limit(1)
      );
      row.sort_order = (data?.[0]?.sort_order || 0) + 1;
      row.active = true;
      must(await db.from('questions').insert(row));
    }
    revalidatePath('/dashboard/questions');
    return id ? 'Question saved' : 'Question added';
  });
}

/* ---------- Settings ---------- */

export async function saveSettings(formData) {
  return run(async () => {
    await needAdmin();
    const rows = Object.keys(DEFAULT_SETTINGS)
      .filter((key) => formData.has(key))
      .map((key) => ({ key, value: text(formData, key) }));
    must(await admin().from('settings').upsert(rows, { onConflict: 'key' }));
    revalidatePath('/dashboard/settings');
    return 'Settings saved';
  });
}

/* ---------- Team ---------- */

export async function createUser(formData) {
  return run(async () => {
    await needAdmin();
    const email = text(formData, 'email').toLowerCase();
    const password = String(formData.get('password') || '');
    const name = text(formData, 'name');
    const role = text(formData, 'role') === 'admin' ? 'admin' : 'staff';
    if (!email) throw new Error('Enter an email.');
    if (password.length < 8) throw new Error('The password needs 8 characters or more.');

    const db = admin();
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) throw new Error(error.message);
    must(await db.from('profiles').upsert({ id: data.user.id, full_name: name || email, role, active: true }));
    revalidatePath('/dashboard/team');
    return 'User created';
  });
}

export async function setUserActive(formData) {
  return run(async () => {
    const me = await needAdmin();
    const id = text(formData, 'id');
    if (!id || id === me.id) throw new Error('You cannot change your own account.');
    const active = formData.get('active') === '1';
    must(await admin().from('profiles').update({ active }).eq('id', id));
    revalidatePath('/dashboard/team');
    return active ? 'User enabled' : 'User disabled';
  });
}

/* ---------- WhatsApp visit links ---------- */

export async function createVisit({ branchId, name, phone, lang }) {
  const user = await needUser();
  const db = admin();
  const settings = await getSettings();

  const normalized = normalizePhone(phone, settings.default_country_code);
  if (!normalized) return { error: 'Enter a valid mobile number.' };

  const { data: branch } = await db.from('branches').select('id, name, active').eq('id', branchId).maybeSingle();
  if (!branch || !branch.active) return { error: 'Choose a QR code.' };

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

  const ar = lang === 'ar';
  const link = `${getBaseUrl()}/v/${token}${ar ? '?l=ar' : ''}`;
  const template = (ar && settings.whatsapp_message_ar) || settings.whatsapp_message;
  const message = template
    .replaceAll('{name}', customer || (ar ? 'عزيزي العميل' : 'there'))
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
