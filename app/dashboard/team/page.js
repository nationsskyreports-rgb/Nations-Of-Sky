import { admin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';
import { createUser, setUserActive } from '@/app/dashboard/actions';

export const dynamic = 'force-dynamic';

export default async function Team() {
  const me = await requireAdmin();
  const db = admin();
  const { data: profiles } = await db.from('profiles').select('*').order('created_at');
  const { data: authList } = await db.auth.admin.listUsers({ perPage: 200 });
  const email = new Map((authList?.users || []).map((u) => [u.id, u.email]));

  return (
    <div className="d-page narrow">
      <div className="d-head">
        <h1>Team</h1>
      </div>

      <form className="d-card d-form" action={createUser}>
        <h2>Add a user</h2>
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Password (8 characters or more)
          <input name="password" type="text" minLength={8} required autoComplete="off" />
        </label>
        <label>
          Role
          <select name="role" defaultValue="staff">
            <option value="staff">Sales / Customer excellence (send links, view results)</option>
            <option value="admin">Admin (everything)</option>
          </select>
        </label>
        <div className="d-actions">
          <button className="d-btn">Create user</button>
        </div>
      </form>

      <section className="d-card">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(profiles || []).map((p) => (
                <tr key={p.id}>
                  <td>{p.full_name}</td>
                  <td>{email.get(p.id) || '-'}</td>
                  <td>{p.role === 'admin' ? 'Admin' : 'Staff'}</td>
                  <td>{p.active ? 'Active' : 'Disabled'}</td>
                  <td>
                    {p.id !== me.id ? (
                      <form action={setUserActive}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="active" value={p.active ? '0' : '1'} />
                        <button className="d-btn ghost">{p.active ? 'Disable' : 'Enable'}</button>
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
