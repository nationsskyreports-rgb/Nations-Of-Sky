import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }) {
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
            We hear.
            <br />
            We act.
            <br />
            We deliver.
          </h2>
          <p>Every visit, every branch, one clear picture of how customers feel.</p>
        </div>
        <p className="lg-foot">Nations of Sky</p>
      </aside>

      <section className="lg-main">
        <div className="lg-wrap">
          <h1>Welcome back</h1>
          <p className="lg-sub">Sign in to see your branches' feedback.</p>
          <LoginForm denied={searchParams?.e === 'access'} />
        </div>
      </section>
    </main>
  );
}
