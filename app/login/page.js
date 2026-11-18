import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="light lg-shell">
      <aside className="lg-brand">
        <span className="lg-mark">
          <img src="/logo.png" alt="" width="28" height="28" />
        </span>
        <div className="lg-pitch">
          <p className="lg-kicker">Voice of Customer</p>
          <h2>
            We Listen.
            <br />
            We Care.
            <br />
            We Go Beyond.
          </h2>
          <p>Every visit, every branch, one clear picture of how customers feel.</p>
        </div>
        <p className="lg-foot">Nations of Sky</p>
      </aside>

      <section className="lg-main">
        <div className="lg-wrap">
          <h1>Dashboard</h1>
          <p className="lg-sub">Enter the team password to continue.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
