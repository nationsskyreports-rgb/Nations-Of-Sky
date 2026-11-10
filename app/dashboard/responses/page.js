import Link from 'next/link';
import AutoFilters from '@/components/AutoFilters';
import LiveRefresh from '@/components/LiveRefresh';
import { admin, fetchAll, one } from '@/lib/supabase-admin';
import { fmtDateTime, rangeStart } from '@/lib/format';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const STATUSES = [
  ['', 'All scans'],
  ['scanned', 'Scanned only'],
  ['rated', 'Rated'],
  ['complete', 'Completed'],
];
const RANGES = [
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
  ['90d', 'Last 90 days'],
  ['all', 'All time'],
];

function statusOf(response) {
  if (response?.status === 'complete') return 'complete';
  if (response?.rating) return 'rated';
  return 'scanned';
}

const LABEL = { complete: 'Completed', rated: 'Rated', scanned: 'Scanned only' };

export default async function Responses({ searchParams }) {
  const range = RANGES.some(([v]) => v === searchParams?.range) ? searchParams.range : '30d';
  const branch = searchParams?.branch || '';
  const status = STATUSES.some(([v]) => v === searchParams?.status) ? searchParams.status || '' : '';
  const source = searchParams?.source || '';
  const page = Math.max(0, parseInt(searchParams?.page, 10) || 0);
  const since = rangeStart(range);
  const db = admin();

  const scans = await fetchAll(() => {
    let q = db
      .from('scans')
      .select(
        'id, created_at, source, os, browser, device, country, city, branch_id, branches(name), visits(customer_name, customer_phone, staff_name), responses(rating, status, name, phone, answers)'
      )
      .order('created_at', { ascending: false });
    if (since) q = q.gte('created_at', since);
    if (branch) q = q.eq('branch_id', branch);
    if (source) q = q.eq('source', source);
    return q;
  });

  const { data: branches } = await db.from('branches').select('id, name').order('name');

  const all = scans
    .map((s) => ({ ...s, response: one(s.responses), visit: one(s.visits), branch: one(s.branches) }))
    .filter((s) => !status || statusOf(s.response) === status);

  const rows = all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pages = Math.ceil(all.length / PAGE_SIZE);

  const qs = (extra) => {
    const p = new URLSearchParams({ range, branch, status, source, ...extra });
    [...p.keys()].forEach((k) => !p.get(k) && p.delete(k));
    return `?${p.toString()}`;
  };

  return (
    <div className="d-page">
      <div className="d-head">
        <h1>
          Activity <LiveRefresh />
        </h1>
        <AutoFilters
          csv
          fields={[
            { name: 'status', defaultValue: '', options: STATUSES },
            { name: 'range', defaultValue: '30d', options: RANGES },
            { name: 'branch', defaultValue: '', options: [['', 'All QR codes'], ...(branches || []).map((b) => [b.id, b.name])] },
            { name: 'source', defaultValue: '', options: [['', 'QR + WhatsApp'], ['qr', 'QR code'], ['whatsapp', 'WhatsApp link']] },
          ]}
        />
      </div>

      <p className="d-note">{all.length} results</p>

      <section className="d-card">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>When</th>
                <th>QR code</th>
                <th>Source</th>
                <th>Device</th>
                <th>Location</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Answers</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = statusOf(r.response);
                const name = r.response?.name || r.visit?.customer_name;
                const phone = r.response?.phone || r.visit?.customer_phone;
                const answers = Array.isArray(r.response?.answers) ? r.response.answers : [];
                return (
                  <tr key={r.id}>
                    <td>{fmtDateTime(r.created_at)}</td>
                    <td>{r.branch?.name || '-'}</td>
                    <td>{r.source === 'whatsapp' ? `WhatsApp${r.visit?.staff_name ? ` (${r.visit.staff_name})` : ''}` : 'QR'}</td>
                    <td>{[r.device, r.os, r.browser].filter(Boolean).join(' / ')}</td>
                    <td>{[r.city, r.country].filter(Boolean).join(', ') || '-'}</td>
                    <td>
                      {name || phone ? (
                        <>
                          {name || ''}
                          {name && phone ? <br /> : null}
                          {phone || ''}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{r.response?.rating ? `${r.response.rating} / 5` : '-'}</td>
                    <td>
                      <span className={`d-badge ${st}`}>{LABEL[st]}</span>
                    </td>
                    <td>
                      {answers.length ? (
                        <details>
                          <summary>{answers.length} answers</summary>
                          <ul className="d-answers">
                            {answers.map((a) => (
                              <li key={a.id}>
                                <span>{a.label}</span>
                                <b>{String(a.value)}</b>
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan="9" className="d-empty">
                    Nothing here yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {pages > 1 && (
        <div className="d-pager">
          {page > 0 && (
            <Link className="d-btn ghost" href={qs({ page: String(page - 1) })}>
              Previous
            </Link>
          )}
          <span>
            Page {page + 1} of {pages}
          </span>
          {page + 1 < pages && (
            <Link className="d-btn ghost" href={qs({ page: String(page + 1) })}>
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
