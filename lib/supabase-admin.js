import { createClient } from '@supabase/supabase-js';

let client = null;

export function admin() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Next.js keeps fetch results in its data cache; every read here must hit the database.
      global: { fetch: (input, init = {}) => fetch(input, { ...init, cache: 'no-store' }) },
    });
  }
  return client;
}

// Supabase returns at most 1000 rows per request, so page through the results.
export async function fetchAll(factory, max = 20000) {
  const out = [];
  for (let from = 0; from < max; from += 1000) {
    const { data, error } = await factory().range(from, from + 999);
    if (error) throw new Error(error.message);
    out.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export function one(value) {
  return Array.isArray(value) ? value[0] || null : value || null;
}
