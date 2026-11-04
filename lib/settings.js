import { admin } from '@/lib/supabase-admin';
import { DEFAULT_SETTINGS } from '@/lib/config';

export async function getSettings() {
  const { data } = await admin().from('settings').select('key, value');
  const settings = { ...DEFAULT_SETTINGS };
  (data || []).forEach((row) => {
    if (row.key in DEFAULT_SETTINGS) settings[row.key] = row.value;
  });
  return settings;
}

export async function getActiveQuestions() {
  const { data } = await admin()
    .from('questions')
    .select('id, label, type, options, required')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  return data || [];
}
