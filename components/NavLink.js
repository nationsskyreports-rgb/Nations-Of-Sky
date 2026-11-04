'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }) {
  const pathname = usePathname() || '';
  const active = href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={`d-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
      {children}
    </Link>
  );
}
