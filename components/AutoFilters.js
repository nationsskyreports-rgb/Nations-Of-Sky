'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Filters that apply the moment a value changes. The URL stays the source of truth.
export default function AutoFilters({ fields, csv = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const valueOf = (f) => params.get(f.name) ?? f.defaultValue ?? '';

  const change = (name, value) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete('page');
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const exportParams = new URLSearchParams(params.toString());
  exportParams.delete('page');
  const exportQs = exportParams.toString();

  return (
    <div className={`d-filters ${pending ? 'busy' : ''}`}>
      {fields.map((f) => (
        <select key={f.name} value={valueOf(f)} onChange={(e) => change(f.name, e.target.value)} aria-label={f.name}>
          {f.options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ))}
      {csv ? (
        <a className="d-btn ghost" href={`/api/export${exportQs ? `?${exportQs}` : ''}`}>
          Download CSV
        </a>
      ) : null}
      {pending ? <span className="d-updating">Updating...</span> : null}
    </div>
  );
}
