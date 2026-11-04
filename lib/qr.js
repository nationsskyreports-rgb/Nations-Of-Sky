import QRCode from 'qrcode';

// Builds an SVG QR code (error correction H) with an optional logo in the middle.
export function buildQrSvg(text, { logo = null, margin = 2, dark = '#0a0a0a', light = '#ffffff' } = {}) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size;
  const total = n + margin * 2;

  const box = logo ? n * 0.22 : 0;
  const from = (n - box) / 2;
  const to = from + box;

  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.modules.get(r, c)) continue;
      if (logo && c + 1 > from - 0.5 && c < to + 0.5 && r + 1 > from - 0.5 && r < to + 0.5) continue;
      d += `M${c + margin} ${r + margin}h1v1h-1z`;
    }
  }

  let center = '';
  if (logo) {
    const pad = box * 0.12;
    center =
      `<rect x="${from + margin - 0.5}" y="${from + margin - 0.5}" width="${box + 1}" height="${box + 1}" rx="1.5" fill="${light}"/>` +
      `<image href="${logo}" x="${from + margin + pad}" y="${from + margin + pad}" width="${box - pad * 2}" height="${box - pad * 2}"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${light}"/>` +
    `<path d="${d}" fill="${dark}"/>${center}</svg>`
  );
}

export async function logoDataUrl(src = '/logo.png') {
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

export function svgToPngBlob(svg, size = 2000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('png'))), 'image/png');
    };
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
