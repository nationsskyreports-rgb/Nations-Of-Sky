import { NextResponse } from 'next/server';
import { admin, fetchAll, one } from '@/lib/supabase-admin';
import { getCurrentUser } from '@/lib/auth';
import { rangeStart } from '@/lib/format';
import { TIMEZONE } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const since = rangeStart(sp.get('range') || '30d');
  const branch = sp.get('branch');
  const source = sp.get('source');
  const status = sp.get('status');
  const db = admin();

  const scans = await fetchAll(() => {
    let q = db
      .from('scans')
      .select(
        'created_at, source, os, browser, device, country, city, branches(name), visits(customer_name, customer_phone, staff_name), responses(rating, status, name, phone, answers)'
      )
      .order('created_at', { ascending: false });
    if (since) q = q.gte('created_at', since);
    if (branch) q = q.eq('branch_id', branch);
    if (source) q = q.eq('source', source);
    return q;
  });

  const header = [
    'Time',
    'Branch',
    'Source',
    'Staff',
    'Device',
    'OS',
    'Browser',
    'Country',
    'City',
    'Name',
    'Mobile',
    'Rating',
    'Status',
    'Answers',
  ];

  const lines = [header.map(esc).join(',')];
  for (const s of scans) {
    const r = one(s.responses);
    const v = one(s.visits);
    const st = r?.status === 'complete' ? 'Completed' : r?.rating ? 'Rated' : 'Scanned only';
    if (status === 'scanned' && st !== 'Scanned only') continue;
    if (status === 'rated' && st !== 'Rated') continue;
    if (status === 'complete' && st !== 'Completed') continue;
    const answers = (Array.isArray(r?.answers) ? r.answers : []).map((a) => `${a.label}: ${a.value}`).join(' | ');
    lines.push(
      [
        new Date(s.created_at).toLocaleString('en-GB', { timeZone: TIMEZONE }),
        one(s.branches)?.name,
        s.source === 'whatsapp' ? 'WhatsApp' : 'QR',
        v?.staff_name,
        s.device,
        s.os,
        s.browser,
        s.country,
        s.city,
        r?.name || v?.customer_name,
        r?.phone || v?.customer_phone,
        r?.rating,
        st,
        answers,
      ]
        .map(esc)
        .join(',')
    );
  }

  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="voice-of-customer.csv"',
    },
  });
}
