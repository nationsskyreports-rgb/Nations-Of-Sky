import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  return (
    <main className="vc-shell">
      <div className="vc-glow" />
      <div className="vc-card">
        <img className="vc-logo" src="/logo.png" alt="" width="46" height="46" />
        <p className="vc-eyebrow">Voice of Customer</p>
        <h1 className="vc-title small">Sign in</h1>
        <LoginForm denied={searchParams?.e === 'access'} />
      </div>
    </main>
  );
}
