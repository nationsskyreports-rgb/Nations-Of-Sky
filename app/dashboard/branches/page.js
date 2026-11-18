import Link from 'next/link';
import { admin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';
import { getBaseUrl } from '@/lib/server-utils';
import { createBranch, updateBranch } from '@/app/dashboard/actions';
import BranchQr from '@/components/BranchQr';
import ActionForm from '@/components/ActionForm';

export const dynamic = 'force-dynamic';

export default async function Branches() {
  await requireAdmin();
  const base = getBaseUrl();
  const { data: branches } = await admin().from('branches').select('*').order('created_at');

  return (
    <div className="d-page">
      <div className="d-head">
        <h1>QR code</h1>
      </div>
      <p className="d-note">
        One QR code for every branch. The customer picks the branch inside the survey. It points to{' '}
        <b>{base}/r</b> &mdash; check this is the final address before printing.
      </p>

      <section className="d-card">
        <BranchQr url={`${base}/r`} fileName="nations-of-sky-qr" />
        <Link className="d-btn" href="/dashboard/card">
          Printable card
        </Link>
      </section>

      <div className="d-head">
        <h1>Branches</h1>
      </div>
      <p className="d-note">Active branches are the choices the customer sees after scanning.</p>

      <ActionForm className="d-card d-inline" action={createBranch} success="Branch added" reset>
        <input name="name" placeholder="New branch name" required />
        <button className="d-btn">Add branch</button>
      </ActionForm>

      <div className="d-cards">
        {(branches || []).map((b) => (
          <ActionForm className="d-card d-form" action={updateBranch} success="Branch saved" key={b.id}>
            <input type="hidden" name="id" value={b.id} />
            <label>
              Name
              <input name="name" defaultValue={b.name} required />
            </label>
            <label className="d-check">
              <input type="checkbox" name="active" defaultChecked={b.active} />
              Shown to customers
            </label>
            <button className="d-btn ghost">Save</button>
          </ActionForm>
        ))}
        {!(branches || []).length && <p className="d-note">No branches yet. Add the first one above.</p>}
      </div>
    </div>
  );
}
