'use client';

import { useEffect, useState } from 'react';
import { createVisit } from '@/app/dashboard/actions';

export default function SendForm({ branches }) {
  const [branchId, setBranchId] = useState(branches[0]?.id || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState('en');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('voc_branch');
      if (saved && branches.some((b) => b.id === saved)) setBranchId(saved);
    } catch {}
  }, [branches]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      localStorage.setItem('voc_branch', branchId);
    } catch {}
    const res = await createVisit({ branchId, name, phone, lang });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setResult(res);
    setName('');
    setPhone('');
    window.open(res.waUrl, '_blank', 'noopener');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <form className="d-card d-form" onSubmit={submit}>
      <label>
        QR code
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Customer name (optional)
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </label>
      <label>
        Message language
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
      </label>
      <label>
        Customer mobile
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          placeholder="01012345678"
          required
        />
      </label>
      {error ? <p className="vc-error">{error}</p> : null}
      <button className="d-btn" disabled={busy || !branchId}>
        {busy ? 'Preparing...' : 'Send via WhatsApp'}
      </button>

      {result ? (
        <div className="d-result">
          <p>WhatsApp should open with the message ready. Press send there.</p>
          <div className="d-actions">
            <a className="d-btn ghost" href={result.waUrl} target="_blank" rel="noopener noreferrer">
              Open WhatsApp again
            </a>
            <button type="button" className="d-btn ghost" onClick={copy}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
