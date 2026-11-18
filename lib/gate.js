// One shared password for the whole dashboard. No user accounts.
// The password itself lives in the DASHBOARD_PASSWORD environment variable.
// The cookie only holds a hash of it, and it is checked on every dashboard request.

export const SESSION_COOKIE = 'voc_session';
export const SESSION_DAYS = 30;

export async function sessionToken(password) {
  const data = new TextEncoder().encode(`voc:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
