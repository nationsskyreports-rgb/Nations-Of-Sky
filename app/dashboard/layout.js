import { requireUser } from '@/lib/auth';
import NavLink from '@/components/NavLink';
import SignOut from '@/components/SignOut';
import { ToastProvider } from '@/components/Toast';

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
      ['/dashboard/branches', 'QR codes'],
      ['/dashboard/questions', 'Questions'],
      ['/dashboard/settings', 'Settings'],
      ['/dashboard/team', 'Team']
    );
  }

  return (
    <div className="light d-wrap">
      <ToastProvider>
      <header className="d-top no-print">
        <div className="d-brand">
          <span className="d-mark">
            <img src="/logo.png" alt="" width="20" height="20" />
          </span>
          <span>Voice of Customer</span>
        </div>
        <nav className="d-nav" aria-label="Main">
          {links.map(([href, label]) => (
            <NavLink key={href} href={href}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="d-user">
          <span className="d-avatar" aria-hidden="true">
            {String(user.name || '?').trim().charAt(0).toUpperCase()}
          </span>
          <span className="d-user-name">{user.name}</span>
          <SignOut />
        </div>
      </header>
      <div className="d-body">{children}</div>
      </ToastProvider>
    </div>
  );
}
