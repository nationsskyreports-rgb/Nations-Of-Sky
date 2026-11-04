import Link from 'next/link';
import { admin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';
import { getBaseUrl } from '@/lib/server-utils';
import { createBranch, updateBranch } from '@/app/dashboard/actions';
import BranchQr from '@/components/BranchQr';

export const dynamic = 'force-dynamic';

export default async function Branches() {
  await requireAdmin();
  const base = getBaseUrl();
  const { data: branches } = await admin().from('branches').select('*').order('created_at');

  return (
    <div className="d-page">
      <div className="d-head">
        <h1>Branches</h1>
      </div>
      <p className="d-note">
        QR codes point to <b>{base}</b>. Check this is the final address before printing.
      </p>

      <form className="d-card d-inline" action={createBranch}>
        <input name="name" placeholder="New branch name" required />
        <button className="d-btn">Add branch</button>
      </form>

      <div className="d-cards">
        {(branches || []).map((b) => (
          <section className="d-card" key={b.id}>
            <form className="d-form" action={updateBranch}>
              <input type="hidden" name="id" value={b.id} />
              <label>
                Name
                <input name="name" defaultValue={b.name} required />
              </label>
              <label className="d-check">
                <input type="checkbox" name="active" defaultChecked={b.active} />
                Active
              </label>
              <button className="d-btn ghost">Save</button>
            </form>
            <BranchQr url={`${base}/r/${b.slug}`} fileName={`qr-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />
            <Link className="d-btn" href={`/dashboard/branches/${b.id}/card`}>
              Printable card
            </Link>
          </section>
        ))}
        {!(branches || []).length && <p className="d-note">No branches yet. Add the first one above.</p>}
      </div>
    </div>
  );
}
