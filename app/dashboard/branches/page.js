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
        <h1>QR codes</h1>
      </div>
      <p className="d-note">
        QR codes point to <b>{base}</b>. Check this is the final address before printing.
      </p>

      <ActionForm className="d-card d-inline" action={createBranch} success="QR code added" reset>
        <input name="name" placeholder="New QR code name" required />
        <button className="d-btn">Add QR code</button>
      </ActionForm>

      <div className="d-cards">
        {(branches || []).map((b) => (
          <section className="d-card" key={b.id}>
            <ActionForm className="d-form" action={updateBranch} success="QR code saved">
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
            </ActionForm>
            <BranchQr url={`${base}/r/${b.slug}`} fileName={`qr-${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} />
            <Link className="d-btn" href={`/dashboard/branches/${b.id}/card`}>
              Printable card
            </Link>
          </section>
        ))}
        {!(branches || []).length && <p className="d-note">No QR codes yet. Add the first one above.</p>}
      </div>
    </div>
  );
}
