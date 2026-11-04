export const metadata = { title: 'Voice of Customer' };

export default function NotFound() {
  return (
    <main className="vc-shell">
      <div className="vc-card">
        <span className="vc-logo" aria-hidden="true" />
        <p className="vc-eyebrow">Voice of Customer</p>
        <h1 className="vc-title">This link is no longer active.</h1>
        <p className="vc-sub">Please ask our team for a new one.</p>
        <h2 className="vc-title" dir="rtl" lang="ar" style={{ fontSize: 22 }}>
          هذا الرابط لم يعد متاحاً.
        </h2>
        <p className="vc-foot">Nations of Sky</p>
      </div>
    </main>
  );
}
