import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import SignOut from '@/components/SignOut';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function DashboardLayout({ children }) {
  const user = await requireUser();
  const isAdmin = user.role === 'admin';

  const links = [
    ['/dashboard', 'Overview'],
    ['/dashboard/responses', 'Activity'],
    ['/dashboard/send', 'Send link'],
  ];
  if (isAdmin) {
    links.push(
      ['/dashboard/branches', 'Branches'],
      ['/dashboard/questions', 'Questions'],
      ['/dashboard/settings', 'Settings'],
      ['/dashboard/team', 'Team']
    );
  }

  return (
    <div className="d-wrap">
      <header className="d-top no-print">
        <div className="d-brand">
          <img src="/logo.png" alt="" width="28" height="28" />
          <span>Voice of Customer</span>
        </div>
        <nav className="d-nav">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="d-link">
              {label}
            </Link>
          ))}
        </nav>
        <div className="d-user">
          <span>{user.name}</span>
          <SignOut />
        </div>
      </header>
      <div className="d-body">{children}</div>
    </div>
  );
}
