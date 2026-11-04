import Link from 'next/link';
import { admin, fetchAll, one } from '@/lib/supabase-admin';
import { avg, pct, rangeStart, dayKey, fmtDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

const RANGES = [
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
  ['90d', 'Last 90 days'],
  ['all', 'All time'],
];

function Stat({ label, value, hint }) {
  return (
    <div className="d-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="d-bars">
      {rows.map((r) => (
        <div className="d-bar" key={r.label}>
          <span className="d-bar-label">{r.label}</span>
          <div className="d-bar-track">
            <i style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          <span className="d-bar-value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

export default async function Overview({ searchParams }) {
  const range = RANGES.some(([v]) => v === searchParams?.range) ? searchParams.range : '30d';
  const branch = searchParams?.branch || '';
  const since = rangeStart(range);
  const db = admin();

  const scans = await fetchAll(() => {
    let q = db
      .from('scans')
      .select('id, branch_id, source, device, created_at, responses(rating, status)')
      .order('created_at', { ascending: false });
    if (since) q = q.gte('created_at', since);
    if (branch) q = q.eq('branch_id', branch);
    return q;
  });

  const { data: branches } = await db.from('branches').select('id, name').order('name');
  const branchName = new Map((branches || []).map((b) => [b.id, b.name]));

  let visitsQuery = db.from('visits').select('id, opened_at, responded_at');
  if (since) visitsQuery = visitsQuery.gte('created_at', since);
  if (branch) visitsQuery = visitsQuery.eq('branch_id', branch);
  const { data: visits } = await visitsQuery.limit(5000);

  let lowQuery = db
    .from('responses')
    .select('id, rating, name, phone, created_at, branches(name)')
    .lte('rating', 2)
    .order('created_at', { ascending: false })
    .limit(8);
  if (since) lowQuery = lowQuery.gte('created_at', since);
  if (branch) lowQuery = lowQuery.eq('branch_id', branch);
  const { data: low } = await lowQuery;

  const rows = scans.map((s) => ({ ...s, response: one(s.responses) }));
  const rated = rows.filter((r) => r.response?.rating);
  const completed = rows.filter((r) => r.response?.status === 'complete');
  const average = avg(rated.map((r) => r.response.rating));

  const distribution = [5, 4, 3, 2, 1].map((n) => ({
    label: `${n} star${n > 1 ? 's' : ''}`,
    value: rated.filter((r) => r.response.rating === n).length,
  }));

  const byBranch = (branches || [])
    .map((b) => {
      const mine = rows.filter((r) => r.branch_id === b.id);
      const mineRated = mine.filter((r) => r.response?.rating);
      return {
        id: b.id,
        name: b.name,
        scans: mine.length,
        rated: mineRated.length,
        completed: mine.filter((r) => r.response?.status === 'complete').length,
        avg: avg(mineRated.map((r) => r.response.rating)),
      };
    })
    .filter((b) => b.scans > 0 || !branch);

  const bySource = [
    { label: 'QR code', value: rows.filter((r) => r.source === 'qr').length },
    { label: 'WhatsApp link', value: rows.filter((r) => r.source === 'whatsapp').length },
  ];

  const byDevice = ['mobile', 'tablet', 'desktop'].map((d) => ({
    label: d[0].toUpperCase() + d.slice(1),
    value: rows.filter((r) => r.device === d).length,
  }));

  const days = range === '7d' ? 7 : 14;
  const perDay = Array.from({ length: days }, (_, i) => {
    const key = dayKey(Date.now() - (days - 1 - i) * 86400000);
    return { label: key.slice(5), value: rows.filter((r) => dayKey(r.created_at) === key).length };
  });

  const v = visits || [];

  return (
    <div className="d-page">
      <div className="d-head">
        <h1>Overview</h1>
        <form className="d-filters" method="get">
          <select name="range" defaultValue={range}>
            {RANGES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="branch" defaultValue={branch}>
            <option value="">All branches</option>
            {(branches || []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button className="d-btn">Apply</button>
        </form>
      </div>

      <div className="d-stats">
        <Stat label="Scans" value={rows.length} hint="Every time the page was opened" />
        <Stat label="Scanned only" value={rows.length - rated.length} hint="Opened, no rating" />
        <Stat label="Rated" value={rated.length} hint={pct(rated.length, rows.length)} />
        <Stat label="Completed" value={completed.length} hint={pct(completed.length, rows.length)} />
        <Stat label="Average rating" value={average ? average.toFixed(2) : '-'} hint="Out of 5" />
      </div>

      <div className="d-grid">
        <section className="d-card">
          <h2>Scans per day</h2>
          <Bars rows={perDay} />
        </section>
        <section className="d-card">
          <h2>Ratings</h2>
          <Bars rows={distribution} />
        </section>
        <section className="d-card">
          <h2>Source</h2>
          <Bars rows={bySource} />
          <h2 className="d-gap">Device</h2>
          <Bars rows={byDevice} />
        </section>
        <section className="d-card">
          <h2>WhatsApp links</h2>
          <div className="d-mini">
            <Stat label="Sent" value={v.length} />
            <Stat label="Opened" value={v.filter((x) => x.opened_at).length} />
            <Stat label="Rated" value={v.filter((x) => x.responded_at).length} />
          </div>
        </section>
      </div>

      <section className="d-card">
        <h2>By branch</h2>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Branch</th>
                <th>Scans</th>
                <th>Rated</th>
                <th>Completed</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {byBranch.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.scans}</td>
                  <td>{b.rated}</td>
                  <td>{b.completed}</td>
                  <td>{b.avg ? b.avg.toFixed(2) : '-'}</td>
                </tr>
              ))}
              {!byBranch.length && (
                <tr>
                  <td colSpan="5" className="d-empty">
                    No branches yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="d-card">
        <h2>Latest low ratings (2 stars or less)</h2>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Branch</th>
                <th>Rating</th>
                <th>Name</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {(low || []).map((r) => (
                <tr key={r.id}>
                  <td>{fmtDateTime(r.created_at)}</td>
                  <td>{one(r.branches)?.name || branchName.get(r.branch_id) || '-'}</td>
                  <td>{r.rating}</td>
                  <td>{r.name || '-'}</td>
                  <td>{r.phone || '-'}</td>
                </tr>
              ))}
              {!(low || []).length && (
                <tr>
                  <td colSpan="5" className="d-empty">
                    Nothing here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="d-note">
          <Link href="/dashboard/responses">See every scan and answer</Link>
        </p>
      </section>
    </div>
  );
}
