import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionToken } from '@/lib/gate';

export async function middleware(request) {
  const password = process.env.DASHBOARD_PASSWORD || '';
  const expected = password ? await sessionToken(password) : '';
  const current = request.cookies.get(SESSION_COOKIE)?.value;

  if (!expected || current !== expected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
