'use client';

import { useEffect, useState } from 'react';
import { buildQrSvg, logoDataUrl, svgToPngBlob, downloadBlob } from '@/lib/qr';

export default function BranchQr({ url, fileName }) {
  const [svg, setSvg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    logoDataUrl()
      .then((logo) => alive && setSvg(buildQrSvg(url, { logo })))
      .catch(() => alive && setSvg(buildQrSvg(url)));
    return () => {
      alive = false;
    };
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="d-qr">
      <div className="d-qr-img" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="d-actions">
        <button
          type="button"
          className="d-btn ghost"
          disabled={!svg}
          onClick={() => downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${fileName}.svg`)}
        >
          SVG
        </button>
        <button
          type="button"
          className="d-btn ghost"
          disabled={!svg}
          onClick={async () => downloadBlob(await svgToPngBlob(svg), `${fileName}.png`)}
        >
          PNG
        </button>
        <button type="button" className="d-btn ghost" onClick={copy}>
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </div>
  );
}
