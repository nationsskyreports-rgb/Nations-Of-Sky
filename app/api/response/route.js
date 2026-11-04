import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase-admin';
import { clip } from '@/lib/server-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const scanId = String(body.scanId || '');
  if (!UUID.test(scanId)) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const db = admin();
  const { data: scan } = await db
    .from('scans')
    .select('id, branch_id, visit_id')
    .eq('id', scanId)
    .maybeSingle();
  if (!scan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const now = new Date().toISOString();
  const row = {
    scan_id: scan.id,
    branch_id: scan.branch_id,
    visit_id: scan.visit_id,
    updated_at: now,
  };

  const rating = Number(body.rating);
  if (Number.isInteger(rating) && rating >= 1 && rating <= 5) row.rating = rating;

  if (body.answers && typeof body.answers === 'object') {
    const { data: questions } = await db.from('questions').select('id, label, type');
    const byId = new Map((questions || []).map((q) => [q.id, q]));
    const list = [];
    let name = null;
    let phone = null;

    for (const [id, raw] of Object.entries(body.answers).slice(0, 40)) {
      const q = byId.get(id);
      if (!q) continue;
      let value = raw;
      if (typeof value === 'string') value = value.trim().slice(0, 2000);
      else if (typeof value !== 'number' && typeof value !== 'boolean') continue;
      if (value === '') continue;
      list.push({ id, label: q.label, type: q.type, value });
      if (q.type === 'name') name = clip(value, 120);
      if (q.type === 'phone') phone = clip(String(value).replace(/[^\d+]/g, ''), 20);
    }
    row.answers = list;
    row.name = name;
    row.phone = phone;
  }

  if (body.final) {
    row.status = 'complete';
    row.completed_at = now;
  }

  const { error } = await db.from('responses').upsert(row, { onConflict: 'scan_id' });
  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 });

  if (scan.visit_id && row.rating) {
    await db
      .from('visits')
      .update({ responded_at: now })
      .eq('id', scan.visit_id)
      .is('responded_at', null);
  }

  return NextResponse.json({ ok: true });
}
