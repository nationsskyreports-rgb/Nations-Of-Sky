'use client';

import { useEffect, useState } from 'react';
import { buildQrSvg, logoDataUrl } from '@/lib/qr';

export default function PrintCard({ url, branchName }) {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let alive = true;
    logoDataUrl()
      .then((logo) => alive && setSvg(buildQrSvg(url, { logo, margin: 1 })))
      .catch(() => alive && setSvg(buildQrSvg(url, { margin: 1 })));
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div className="pc-page">
      <div className="pc-bar no-print">
        <p>
          {branchName}. Print on A5, background graphics on, margins none. Matte or soft-touch paper works best.
        </p>
        <button className="d-btn" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <div className="pc-card">
        <div className="pc-inner">
          <img src="/logo.png" alt="" className="pc-logo" />
          <p className="pc-eyebrow">Voice of Customer</p>
          <h2 className="pc-title">We Hear. We Act. We Deliver.</h2>
          <div className="pc-qr" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="pc-scan">Scan to rate your visit</p>
          <p className="pc-foot">Your feedback helps us improve.</p>
          <p className="pc-brand">Nations of Sky</p>
        </div>
      </div>
    </div>
  );
}
