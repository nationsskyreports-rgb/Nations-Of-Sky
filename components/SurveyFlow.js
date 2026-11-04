'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const STAR = 'M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9L12 2.6z';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

function Lock({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      {open ? <path d="M8 11V8a4 4 0 0 1 7.5-2" /> : <path d="M8 11V8a4 4 0 0 1 8 0v3" />}
    </svg>
  );
}

function Question({ q, value, onChange }) {
  const options = Array.isArray(q.options) ? q.options : [];
  if (q.type === 'choice') {
    return (
      <div className="vc-pills">
        {options.map((o) => (
          <button
            type="button"
            key={o}
            className={`vc-pill ${value === o ? 'on' : ''}`}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === 'yesno') {
    return (
      <div className="vc-pills">
        {['Yes', 'No'].map((o) => (
          <button
            type="button"
            key={o}
            className={`vc-pill ${value === o ? 'on' : ''}`}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === 'nps') {
    return (
      <div>
        <div className="vc-nps">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              type="button"
              key={i}
              className={`vc-pill ${value === i ? 'on' : ''}`}
              onClick={() => onChange(i)}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="vc-nps-legend">
          <span>Not likely</span>
          <span>Very likely</span>
        </div>
      </div>
    );
  }
  if (q.type === 'text') {
    return (
      <textarea
        className="vc-input"
        rows={3}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      className="vc-input"
      type={q.type === 'phone' ? 'tel' : 'text'}
      inputMode={q.type === 'phone' ? 'tel' : 'text'}
      autoComplete={q.type === 'phone' ? 'tel' : 'name'}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function SurveyFlow({ branchSlug, token, customerName, staffName, questions, settings }) {
  const [step, setStep] = useState('intro');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);

  const scanPromise = useRef(null);
  const scanIdRef = useRef(null);
  const ratingRef = useRef(0);
  const answersRef = useRef({});
  const stepRef = useRef('intro');
  ratingRef.current = rating;
  answersRef.current = answers;
  stepRef.current = step;

  // Every page open is logged, even if the customer never answers.
  useEffect(() => {
    let sid = '';
    try {
      sid = localStorage.getItem('voc_sid') || '';
      if (!sid) {
        sid =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Math.random()).slice(2) + Date.now();
        localStorage.setItem('voc_sid', sid);
      }
    } catch {}

    scanPromise.current = fetch('/api/scan', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        branchSlug,
        token,
        sessionId: sid,
        screen: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        referrer: document.referrer,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        scanIdRef.current = d.scanId || null;
        return scanIdRef.current;
      })
      .catch(() => null);
  }, [branchSlug, token]);

  const save = useCallback(async (payload) => {
    const id = await scanPromise.current;
    if (!id) return false;
    try {
      const res = await fetch('/api/response', {
        method: 'POST',
        headers: JSON_HEADERS,
        keepalive: true,
        body: JSON.stringify({ scanId: id, ...payload }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // Autosave answers while the customer types.
  useEffect(() => {
    if (step !== 'details') return;
    const t = setTimeout(() => save({ rating, answers }), 700);
    return () => clearTimeout(t);
  }, [answers, step, rating, save]);

  // Save whatever is there if the page is closed.
  useEffect(() => {
    const onHide = () => {
      if (!scanIdRef.current || stepRef.current === 'done') return;
      const body = JSON.stringify({
        scanId: scanIdRef.current,
        rating: ratingRef.current || undefined,
        answers: answersRef.current,
      });
      try {
        navigator.sendBeacon('/api/response', new Blob([body], { type: 'application/json' }));
      } catch {}
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  const pick = (n) => {
    if (step !== 'intro') return;
    setRating(n);
    if (questions.length) {
      save({ rating: n });
      setTimeout(() => setStep('details'), 600);
    } else {
      save({ rating: n, final: true });
      setTimeout(() => setStep('done'), 600);
    }
  };

  const filled = (q) => {
    const v = answers[q.id];
    return v !== undefined && v !== null && String(v).trim() !== '';
  };
  const canSubmit = questions.every((q) => !q.required || filled(q));

  const submit = async () => {
    setBusy(true);
    await save({ rating, answers, final: true });
    setBusy(false);
    setStep('done');
  };

  const first = (customerName || '').trim().split(/\s+/)[0];
  const showReward = settings.reward_enabled === 'true';
  const minGoogle = parseInt(settings.google_min_rating, 10) || 5;
  const showGoogle = settings.google_review_url && rating >= minGoogle;
  const progress = step === 'intro' ? 0 : step === 'details' ? 66 : 100;
  const active = hover || rating;

  return (
    <main className="vc-shell">
      <div className="vc-glow" />
      <div className="vc-card">
        <img className="vc-logo" src="/logo.png" alt="" width="46" height="46" />
        <p className="vc-eyebrow">Voice of Customer</p>

        {step === 'intro' && (
          <section className="vc-fade" key="intro">
            <p className="vc-hello">{first ? `Hello ${first}` : 'Welcome'}</p>
            <h1 className="vc-title">{settings.intro_headline}</h1>
            <p className="vc-sub">{settings.intro_sub}</p>

            <p className="vc-ask">{staffName ? `How was your visit with ${staffName}?` : 'How was your visit?'}</p>
            <div className="vc-stars" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className={`vc-star ${n <= active ? 'on' : ''}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => pick(n)}
                >
                  <svg viewBox="0 0 24 24" width="44" height="44">
                    <path d={STAR} />
                  </svg>
                </button>
              ))}
            </div>

            {showReward && (
              <div className="vc-gift locked">
                <Lock />
                <div>
                  <strong>A surprise is waiting for you</strong>
                  <span>Unlocks right after your feedback</span>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 'details' && (
          <section className="vc-fade" key="details">
            <h1 className="vc-title">{settings.details_headline}</h1>
            <p className="vc-sub">{settings.details_sub}</p>

            <div className="vc-questions">
              {questions.map((q) => (
                <div className="vc-q" key={q.id}>
                  <label>
                    {q.label}
                    {q.required ? <em> *</em> : null}
                  </label>
                  <Question q={q} value={answers[q.id]} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
                </div>
              ))}
            </div>

            <button type="button" className="vc-btn" disabled={!canSubmit || busy} onClick={submit}>
              {busy ? 'Sending...' : showReward ? 'Unlock my surprise' : 'Send feedback'}
            </button>
          </section>
        )}

        {step === 'done' && (
          <section className="vc-fade" key="done">
            <h1 className="vc-title">{settings.thanks_title}</h1>
            <p className="vc-sub">{settings.thanks_body}</p>

            {showReward && (
              <div className="vc-gift open">
                <Lock open />
                <div>
                  <strong>{settings.reward_title}</strong>
                  <span>{settings.reward_body}</span>
                  {settings.reward_code ? <b className="vc-code">{settings.reward_code}</b> : null}
                </div>
              </div>
            )}

            {settings.reward_link_url && settings.reward_link_label ? (
              <a className="vc-btn" href={settings.reward_link_url} target="_blank" rel="noopener noreferrer">
                {settings.reward_link_label}
              </a>
            ) : null}

            {showGoogle ? (
              <a className="vc-btn ghost" href={settings.google_review_url} target="_blank" rel="noopener noreferrer">
                Share your experience on Google
              </a>
            ) : null}
          </section>
        )}

        <div className="vc-progress" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
        <p className="vc-foot">Nations of Sky</p>
      </div>
    </main>
  );
}
