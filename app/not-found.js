export const metadata = { title: 'Voice of Customer' };

export default function NotFound() {
  return (
    <main className="vc-shell">
      <div className="vc-glow" />
      <div className="vc-card">
        <img className="vc-logo" src="/logo.png" alt="" width="46" height="46" />
        <p className="vc-eyebrow">Voice of Customer</p>
        <h1 className="vc-title">This link is no longer active.</h1>
        <p className="vc-sub">Please ask our team for a new one.</p>
        <p className="vc-foot">Nations of Sky</p>
      </div>
    </main>
  );
}
