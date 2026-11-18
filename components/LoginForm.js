'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/app/auth-actions';

function Eye({ off }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await signIn(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="lg-form">
      <label className="lg-label">
        Password
        <span className="lg-field">
          <input
            className="lg-input"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            autoFocus
            required
          />
          <button
            type="button"
            className="lg-eye"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
          >
            <Eye off={show} />
          </button>
        </span>
      </label>

      {error ? <p className="lg-error">{error}</p> : null}

      <button className="lg-btn" disabled={busy}>
        {busy ? 'Opening...' : 'Open dashboard'}
      </button>
    </form>
  );
}
