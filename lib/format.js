import { TIMEZONE } from '@/lib/config';

export function fmtDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function dayKey(value) {
  return new Date(value).toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

export function avg(list) {
  if (!list.length) return null;
  return list.reduce((a, b) => a + b, 0) / list.length;
}

export function pct(part, total) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export function rangeStart(range) {
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range];
  if (!days) return null;
  return new Date(Date.now() - days * 86400000).toISOString();
}
