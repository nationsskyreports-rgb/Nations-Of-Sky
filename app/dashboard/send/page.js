import { admin, one } from '@/lib/supabase-admin';
import { requireUser } from '@/lib/auth';
import { fmtDateTime } from '@/lib/format';
import SendForm from '@/components/SendForm';

export const dynamic = 'force-dynamic';

export default async function SendPage() {
  const user = await requireUser();
  const db = admin();

  const { data: branches } = await db.from('branches').select('id, name').eq('active', true).order('name');

  let q = db
    .from('visits')
    .select('id, created_at, customer_name, customer_phone, staff_name, opened_at, responded_at, branches(name)')
    .order('created_at', { ascending: false })
    .limit(30);
  if (user.role !== 'admin') q = q.eq('staff_id', user.id);
  const { data: visits } = await q;

  return (
    <div className="d-page narrow">
      <div className="d-head">
        <h1>Send link</h1>
      </div>

      {(branches || []).length ? (
        <SendForm branches={branches} />
      ) : (
        <p className="d-note">No active QR codes yet. An admin needs to add one first.</p>
      )}

      <section className="d-card">
        <h2>Recent links</h2>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Customer</th>
                <th>QR code</th>
                <th>By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(visits || []).map((v) => {
                const st = v.responded_at ? 'complete' : v.opened_at ? 'rated' : 'scanned';
                const label = v.responded_at ? 'Rated' : v.opened_at ? 'Opened' : 'Sent';
                return (
                  <tr key={v.id}>
                    <td>{fmtDateTime(v.created_at)}</td>
                    <td>
                      {v.customer_name || ''}
                      {v.customer_name ? <br /> : null}
                      {v.customer_phone}
                    </td>
                    <td>{one(v.branches)?.name || '-'}</td>
                    <td>{v.staff_name || '-'}</td>
                    <td>
                      <span className={`d-badge ${st}`}>{label}</span>
                    </td>
                  </tr>
                );
              })}
              {!(visits || []).length && (
                <tr>
                  <td colSpan="5" className="d-empty">
                    Nothing sent yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
