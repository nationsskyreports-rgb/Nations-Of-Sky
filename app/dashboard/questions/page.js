import { admin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';
import { QUESTION_TYPES } from '@/lib/config';
import { questionAction } from '@/app/dashboard/actions';
import ActionForm from '@/components/ActionForm';

export const dynamic = 'force-dynamic';

function Fields({ q }) {
  return (
    <>
      <label>
        Question
        <input name="label" defaultValue={q?.label || ''} required />
      </label>
      <label>
        Question (Arabic)
        <input name="label_ar" defaultValue={q?.label_ar || ''} dir="rtl" />
      </label>
      <label>
        Type
        <select name="type" defaultValue={q?.type || 'text'}>
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Choices, one per line (multiple choice only)
        <textarea name="options" rows={3} defaultValue={(q?.options || []).join('\n')} />
      </label>
      <label>
        Choices in Arabic, same order, one per line
        <textarea name="options_ar" rows={3} defaultValue={(q?.options_ar || []).join('\n')} dir="rtl" />
      </label>
      <div className="d-checks">
        <label className="d-check">
          <input type="checkbox" name="required" defaultChecked={q?.required} />
          Required
        </label>
        {q ? (
          <label className="d-check">
            <input type="checkbox" name="active" defaultChecked={q.active} />
            Shown to customers
          </label>
        ) : null}
      </div>
    </>
  );
}

export default async function Questions() {
  await requireAdmin();
  const { data: questions } = await admin().from('questions').select('*').order('sort_order');

  return (
    <div className="d-page narrow">
      <div className="d-head">
        <h1>Questions</h1>
      </div>
      <p className="d-note">
        These appear after the star rating. Changes apply immediately to every QR code and WhatsApp link.
      </p>

      <div className="d-cards one">
        {(questions || []).map((q) => (
          <ActionForm className="d-card d-form" action={questionAction} key={q.id}>
            <input type="hidden" name="id" value={q.id} />
            <Fields q={q} />
            <div className="d-actions">
              <button className="d-btn" name="intent" value="save">
                Save
              </button>
              <button className="d-btn ghost" name="intent" value="up" formNoValidate>
                Move up
              </button>
              <button className="d-btn ghost" name="intent" value="down" formNoValidate>
                Move down
              </button>
              <button
                className="d-btn danger"
                name="intent"
                value="delete"
                formNoValidate
                data-confirm="Delete this question? Answers already collected are kept."
              >
                Delete
              </button>
            </div>
          </ActionForm>
        ))}

        <ActionForm className="d-card d-form" action={questionAction} reset>
          <h2>Add a question</h2>
          <Fields q={null} />
          <div className="d-actions">
            <button className="d-btn" name="intent" value="save">
              Add question
            </button>
          </div>
        </ActionForm>
      </div>
    </div>
  );
}
