import { requireUser } from '@/lib/auth';
import NavLink from '@/components/NavLink';
import ScrollArea from '@/components/ScrollArea';
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
      ['/dashboard/branches', 'QR code'],
      ['/dashboard/questions', 'Questions'],
      ['/dashboard/settings', 'Settings']
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
        <ScrollArea className="d-nav" wrapperClassName="d-nav-wrap" centerActive>
          <nav className="d-nav-inner" aria-label="Main">
            {links.map(([href, label]) => (
              <NavLink key={href} href={href}>
                {label}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
        <div className="d-user">
          <SignOut />
        </div>
      </header>
      <div className="d-body">{children}</div>
      </ToastProvider>
    </div>
  );
}
