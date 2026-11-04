'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Re-reads the page data every few seconds while the tab is open, so new scans and answers appear by themselves.
export default function LiveRefresh({ seconds = 5 }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) router.refresh();
    };
    const timer = setInterval(tick, seconds * 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [router, seconds]);

  return (
    <span className="d-live" title="Updates automatically">
      <i /> Live
    </span>
  );
}
