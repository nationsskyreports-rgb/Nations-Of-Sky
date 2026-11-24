'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { buildQrSvg } from '@/lib/qr';

const DESIGNS = [
  ['mono', 'Black & white'],
  ['dark', 'Black & gold'],
];

const SLOGANS = [
  [['We Listen. We Care.', 'We Go Beyond.'], 'Version 1'],
  [['Your Voice. Our Vision.', 'One Nation.'], 'Version 2'],
];

const QR_LINE = 'Your Voice Shapes Our Skyline';

// A5 card size on screen (1mm = 96 / 25.4 px).
const CARD_W = (148 * 96) / 25.4;
const CARD_H = (210 * 96) / 25.4;

export default function PrintCard({ url, branchName }) {
  const [svg, setSvg] = useState('');
  const [design, setDesign] = useState('mono');
  const [slogan, setSlogan] = useState(0);
  const [scale, setScale] = useState(1);
  const [pdfBusy, setPdfBusy] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setSvg(buildQrSvg(url, { margin: 1 }));
  }, [url]);

  // Shrink the card preview to fit narrow screens (printing and the PDF always use the full size).
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / CARD_W));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const downloadPdf = async () => {
    if (!cardRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
      const png = await toPng(cardRef.current, { pixelRatio: 4, cacheBust: true });
      const pdf = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait', compress: true });
      pdf.addImage(png, 'PNG', 0, 0, 148, 210, undefined, 'FAST');
      pdf.save('QR code.pdf');
    } catch {
    } finally {
      setPdfBusy(false);
    }
  };

  const qr = <div className="pc-qr" dangerouslySetInnerHTML={{ __html: svg }} />;
  const title = SLOGANS[slogan][0].map((line, i) => (
    <span key={line} style={{ display: 'block' }}>
      {line}
    </span>
  ));

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
              title={text.join(' ')}
              onClick={() => setSlogan(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="d-btn" onClick={() => window.print()}>
          Print
        </button>
        <button className="d-btn" disabled={pdfBusy} onClick={downloadPdf}>
          {pdfBusy ? 'Preparing...' : 'Download PDF'}
        </button>
        <p>
          {branchName}. Print on A5, background graphics on, margins none. Matte or soft-touch paper works best.
        </p>
      </div>

      <div className="pc-fit" style={{ width: CARD_W * scale, height: CARD_H * scale }}>
        <div className="pc-scale" style={{ transform: `scale(${scale})` }}>
      {design === 'mono' ? (
        <div className="pc-card mono" ref={cardRef}>
          <div className="pc-top">
            <img src="/logo.png" alt="" className="pc-logo" />
            <h2 className="pc-title">{title}</h2>
          </div>
          <div className="pc-bottom">
            {qr}
            <p className="pc-eyebrow pc-voc">Voice of Customer</p>
            <p className="pc-scan">{QR_LINE}</p>
            <p className="pc-foot">Scan to rate your visit</p>
            <img src="/logo.png" alt="Nations of Sky" className="pc-brand-logo" />
          </div>
        </div>
      ) : (
        <div className="pc-card dark" ref={cardRef}>
          <div className="pc-inner">
            <img src="/logo.png" alt="" className="pc-logo" />
            <h2 className="pc-title">{title}</h2>
            {qr}
            <p className="pc-eyebrow pc-voc">Voice of Customer</p>
            <p className="pc-scan">{QR_LINE}</p>
            <p className="pc-foot">Scan to rate your visit</p>
            <img src="/logo.png" alt="Nations of Sky" className="pc-brand-logo" />
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
