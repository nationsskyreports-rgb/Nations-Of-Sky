import { randomBytes, createHash } from 'node:crypto';
import { headers } from 'next/headers';

const SLUG_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomString(length) {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += SLUG_CHARS[bytes[i] % SLUG_CHARS.length];
  return out;
}

export const randomSlug = () => randomString(6);
export const randomToken = () => randomString(10);

export function normalizePhone(raw, countryCode = '20') {
  let d = String(raw || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = String(countryCode) + d.slice(1);
  else if (d.length <= 10) d = String(countryCode) + d;
  d = d.replace(/\D/g, '');
  return d.length >= 8 && d.length <= 15 ? d : null;
}

export function parseUA(ua = '') {
  const os = /iPhone|iPad|iPod/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
    ? 'Android'
    : /Windows/.test(ua)
    ? 'Windows'
    : /Mac OS X/.test(ua)
    ? 'macOS'
    : /Linux/.test(ua)
    ? 'Linux'
    : 'Other';
  const browser = /EdgA?\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
    ? 'Opera'
    : /SamsungBrowser/.test(ua)
    ? 'Samsung'
    : /FxiOS|Firefox\//.test(ua)
    ? 'Firefox'
    : /CriOS|Chrome\//.test(ua)
    ? 'Chrome'
    : /Safari\//.test(ua)
    ? 'Safari'
    : 'Other';
  const device = /iPad|Tablet/.test(ua) ? 'tablet' : /Mobi|iPhone|Android/.test(ua) ? 'mobile' : 'desktop';
  return { os, browser, device };
}

export function hashIp(ip) {
  if (!ip) return null;
  const salt = process.env.IP_SALT || 'voc';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 24);
}

export function clip(value, max = 200) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}

export function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}
