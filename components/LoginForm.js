'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

function Eye({ off }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

export default function LoginForm({ denied }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState(denied ? 'This account has no access to the dashboard.' : '');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabaseBrowser().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) {
      setError('Wrong email or password.');
      setBusy(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="vc-form">
      <input
        className="vc-input"
        type="email"
        placeholder="Email"
        autoComplete="email"
        autoCapitalize="none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="vc-field">
        <input
          className="vc-input"
          type={show ? 'text' : 'password'}
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="vc-eye"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow((s) => !s)}
        >
          <Eye off={show} />
        </button>
      </div>
      {error ? <p className="vc-error">{error}</p> : null}
      <button className="vc-btn" disabled={busy}>
        {busy ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
