import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase-admin';
import { parseUA, hashIp, clip } from '@/lib/server-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const db = admin();
  let branchId = null;
  let visitId = null;
  let source = 'qr';

  if (body.token) {
    const { data: visit } = await db
      .from('visits')
      .select('id, branch_id')
      .eq('token', String(body.token))
      .maybeSingle();
    if (!visit) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    visitId = visit.id;
    branchId = visit.branch_id;
    source = 'whatsapp';
  } else {
    const { data: branch } = await db
      .from('branches')
      .select('id, active')
      .eq('slug', String(body.branchSlug || ''))
      .maybeSingle();
    if (!branch || !branch.active) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    branchId = branch.id;
  }

  const ua = req.headers.get('user-agent') || '';
  const { os, browser, device } = parseUA(ua);
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const decode = (v) => {
    try {
      return v ? decodeURIComponent(v) : null;
    } catch {
      return v;
    }
  };

  const { data, error } = await db
    .from('scans')
    .insert({
      branch_id: branchId,
      visit_id: visitId,
      source,
      session_id: clip(body.sessionId, 64),
      user_agent: clip(ua, 400),
      os,
      browser,
      device,
      country: clip(req.headers.get('x-vercel-ip-country'), 8),
      city: clip(decode(req.headers.get('x-vercel-ip-city')), 80),
      language: clip((req.headers.get('accept-language') || '').split(',')[0], 16),
      screen: clip(body.screen, 20),
      timezone: clip(body.timezone, 60),
      referrer: clip(body.referrer, 300),
      ip_hash: hashIp(ip),
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 });

  if (visitId) {
    await db
      .from('visits')
      .update({ opened_at: new Date().toISOString() })
      .eq('id', visitId)
      .is('opened_at', null);
  }

  return NextResponse.json({ scanId: data.id });
}
