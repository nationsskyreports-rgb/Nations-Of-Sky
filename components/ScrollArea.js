'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

// Horizontal scroller that shows a fade and an arrow on the side where there is more to see.
// Tapping an arrow scrolls that way. With centerActive the active tab is kept in view.
export default function ScrollArea({ className = '', wrapperClassName = '', centerActive = false, children }) {
  const ref = useRef(null);
  const pathname = usePathname();
  const [more, setMore] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setMore({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    if (el.firstElementChild) ro?.observe(el.firstElementChild);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [update, children]);

  useEffect(() => {
    const el = ref.current;
    if (!centerActive || !el) return;
    const active = el.querySelector('.active');
    if (!active) return;
    const c = el.getBoundingClientRect();
    const a = active.getBoundingClientRect();
    el.scrollLeft += a.left - c.left - (c.width - a.width) / 2;
    update();
  }, [centerActive, pathname, update]);

  const go = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.6), behavior: 'smooth' });
  };

  return (
    <div className={`sa ${wrapperClassName}`}>
      {more.left ? (
        <button type="button" className="sa-edge sa-left" aria-label="Scroll left" onClick={() => go(-1)}>
          <span aria-hidden="true">&lsaquo;</span>
        </button>
      ) : null}
      <div className={className} ref={ref} onScroll={update}>
        {children}
      </div>
      {more.right ? (
        <button type="button" className="sa-edge sa-right" aria-label="Scroll right" onClick={() => go(1)}>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      ) : null}
    </div>
  );
}
