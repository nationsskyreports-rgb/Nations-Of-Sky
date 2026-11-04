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
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true });
  return (data || []).map((q) => ({
    id: q.id,
    label: q.label,
    label_ar: q.label_ar || '',
    type: q.type,
    options: q.options || [],
    options_ar: q.options_ar || [],
    required: q.required,
  }));
}
