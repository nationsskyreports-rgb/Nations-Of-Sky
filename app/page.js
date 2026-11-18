import Link from 'next/link';

export const metadata = { title: 'Voice of Customer' };

export default function Home() {
  return (
    <main className="light hm-shell">
      <div className="hm-card">
        <span className="hm-logo" aria-hidden="true" />
        <p className="hm-eyebrow">Voice of Customer</p>
        <h1 className="hm-title">We Listen. We Care. We Go Beyond.</h1>
        <p className="hm-sub">Every visit, every branch, one clear picture of how customers feel.</p>
        <Link className="hm-btn" href="/dashboard">
          Open dashboard
        </Link>
        <p className="hm-foot">Nations of Sky</p>
      </div>
    </main>
  );
}
