'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { buildQrSvg, logoDataUrl } from '@/lib/qr';

const DESIGNS = [
  ['mono', 'Black & white'],
  ['dark', 'Black & gold'],
];

const SLOGANS = [
  ['We Listen. We Care. We Soar.', 'Version 1'],
  ['Your Voice. Our Vision. One Nation.', 'Version 2'],
];

const QR_LINE = 'Your Voice Shapes Our Skyline';

export default function PrintCard({ url, branchName }) {
  const [svg, setSvg] = useState('');
  const [design, setDesign] = useState('mono');
  const [slogan, setSlogan] = useState(0);

  useEffect(() => {
    let alive = true;
    logoDataUrl()
      .then((logo) => alive && setSvg(buildQrSvg(url, { logo, margin: 1 })))
      .catch(() => alive && setSvg(buildQrSvg(url, { margin: 1 })));
    return () => {
      alive = false;
    };
  }, [url]);

  const qr = <div className="pc-qr" dangerouslySetInnerHTML={{ __html: svg }} />;
  const title = SLOGANS[slogan][0];

  return (
    <div className="pc-page">
      <div className="pc-bar no-print">
        <Link className="d-btn ghost" href="/dashboard/branches">
          &larr; Back to QR codes
        </Link>
        <div className="pc-choose">
          {DESIGNS.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={`d-btn ${design === value ? '' : 'ghost'}`}
              onClick={() => setDesign(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="pc-choose">
          {SLOGANS.map(([text, label], i) => (
            <button
              type="button"
              key={label}
              className={`d-btn ${slogan === i ? '' : 'ghost'}`}
              title={text}
              onClick={() => setSlogan(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="d-btn" onClick={() => window.print()}>
          Print
        </button>
        <p>
          {branchName}. Print on A5, background graphics on, margins none. Matte or soft-touch paper works best.
        </p>
      </div>

      {design === 'mono' ? (
        <div className="pc-card mono">
          <div className="pc-top">
            <img src="/logo.png" alt="" className="pc-logo" />
            <p className="pc-eyebrow">Voice of Customer</p>
            <h2 className="pc-title">{title}</h2>
          </div>
          <div className="pc-bottom">
            {qr}
            <p className="pc-scan">{QR_LINE}</p>
            <p className="pc-foot">Scan to rate your visit</p>
            <p className="pc-brand">Nations of Sky</p>
          </div>
        </div>
      ) : (
        <div className="pc-card dark">
          <div className="pc-inner">
            <img src="/logo.png" alt="" className="pc-logo" />
            <p className="pc-eyebrow">Voice of Customer</p>
            <h2 className="pc-title">{title}</h2>
            {qr}
            <p className="pc-scan">{QR_LINE}</p>
            <p className="pc-foot">Scan to rate your visit</p>
            <p className="pc-brand">Nations of Sky</p>
          </div>
        </div>
      )}
    </div>
  );
}
