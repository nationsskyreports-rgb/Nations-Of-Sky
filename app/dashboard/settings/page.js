import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { SETTING_GROUPS } from '@/lib/config';
import { saveSettings } from '@/app/dashboard/actions';

export const dynamic = 'force-dynamic';

export default async function Settings() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="d-page narrow">
      <div className="d-head">
        <h1>Settings</h1>
      </div>

      <form className="d-cards one" action={saveSettings}>
        {SETTING_GROUPS.map((group) => (
          <section className="d-card d-form" key={group.title}>
            <h2>{group.title}</h2>
            {group.fields.map((f) => (
              <label key={f.key}>
                {f.label}
                {f.type === 'textarea' ? (
                  <textarea name={f.key} rows={3} defaultValue={settings[f.key]} />
                ) : f.type === 'select' ? (
                  <select name={f.key} defaultValue={settings[f.key]}>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o === 'true' ? 'Yes' : 'No'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input name={f.key} defaultValue={settings[f.key]} />
                )}
              </label>
            ))}
          </section>
        ))}
        <div className="d-actions">
          <button className="d-btn">Save settings</button>
        </div>
      </form>
    </div>
  );
}
