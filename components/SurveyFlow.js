'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildText } from '@/lib/i18n';

const STAR = 'M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9L12 2.6z';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const STEPS = ['intro', 'details', 'done'];

// Score colours: thresholds come from settings (green from X, yellow from Y, the rest red).
const makeTone = (settings) => {
  const green = parseInt(settings.nps_green_from, 10) || 9;
  const yellow = parseInt(settings.nps_yellow_from, 10) || 6;
  return (n) => (n >= green ? 'green' : n >= yellow ? 'yellow' : 'red');
};
const HEX = /^#[0-9a-f]{6}$/i;

function Lock({ open }) {
  return (
    <span className="vc-gift-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        {open ? <path d="M8 11V8a4 4 0 0 1 7.5-2" /> : <path d="M8 11V8a4 4 0 0 1 8 0v3" />}
      </svg>
    </span>
  );
}

function Question({ q, value, onChange, lang, t, tone }) {
  const options = Array.isArray(q.options) ? q.options : [];
  const optionsAr = Array.isArray(q.options_ar) ? q.options_ar : [];

  if (q.type === 'choice') {
    return (
      <div className="vc-pills">
        {options.map((o, i) => (
          <button type="button" key={o} className={`vc-pill ${value === o ? 'on' : ''}`} onClick={() => onChange(o)}>
            {lang === 'ar' && optionsAr[i] ? optionsAr[i] : o}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === 'yesno') {
    return (
      <div className="vc-pills">
        {[
          ['Yes', t.yes],
          ['No', t.no],
        ].map(([v, label]) => (
          <button type="button" key={v} className={`vc-pill ${value === v ? 'on' : ''}`} onClick={() => onChange(v)}>
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === 'nps') {
    return (
      <div>
        <div className="vc-nps">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              className={`vc-pill nps-${tone(n)} ${value === n ? 'on' : ''}`}
              onClick={() => onChange(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="vc-nps-legend">
          <span>{t.notLikely}</span>
          <span>{t.veryLikely}</span>
        </div>
      </div>
    );
  }

  if (q.type === 'text') {
    return <textarea className="vc-input" rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }

  return (
    <input
      className="vc-input"
      type={q.type === 'phone' ? 'tel' : 'text'}
      inputMode={q.type === 'phone' ? 'tel' : 'text'}
      autoComplete={q.type === 'phone' ? 'tel' : 'name'}
      dir={q.type === 'phone' ? 'ltr' : undefined}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function SurveyFlow({
  branchSlug,
  token,
  customerName,
  staffName,
  questions,
  settings,
  initialLang = 'en',
  langLocked = false,
}) {
  const [lang, setLang] = useState(initialLang);
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

  const t = buildText(settings, lang);
  const tone = makeTone(settings);
  const themeVars = {};
  [
    ['--bronze', 'color_brand'],
    ['--paper', 'color_bg'],
    ['--ink', 'color_text'],
    ['--red', 'color_low'],
    ['--yellow', 'color_mid'],
    ['--green', 'color_high'],
  ].forEach(([v, k]) => {
    if (HEX.test(settings[k] || '')) themeVars[v] = settings[k];
  });
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const S = (key) => (lang === 'ar' && settings[`${key}_ar`]) || settings[key];

  // Remember the language the customer picked last time.
  useEffect(() => {
    if (langLocked) return;
    try {
      const saved = localStorage.getItem('voc_lang');
      if (saved === 'ar' || saved === 'en') setLang(saved);
    } catch {}
  }, [langLocked]);

  const switchLang = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    try {
      localStorage.setItem('voc_lang', next);
    } catch {}
  };

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
    const timer = setTimeout(() => save({ rating, answers }), 700);
    return () => clearTimeout(timer);
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
  const isRequired = (q) =>
    q.required ||
    (q.type === 'name' && settings.require_name === 'true') ||
    (q.type === 'phone' && settings.require_phone === 'true');
  const valid = (q) => {
    if (!filled(q)) return false;
    if (q.type === 'phone') return String(answers[q.id]).replace(/\D/g, '').length >= 7;
    return true;
  };
  const canSubmit = questions.every((q) => (isRequired(q) ? valid(q) : !filled(q) || valid(q)));

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
  const stepIndex = STEPS.indexOf(step);
  const active = hover || rating;
  const rewardLabel = S('reward_link_label');

  return (
    <main className="vc-shell" dir={dir} lang={lang} style={themeVars}>
      <div className="vc-card">
        {settings.show_lang_switch === 'false' ? null : (
          <button type="button" className="vc-lang" onClick={switchLang}>
            {t.switchTo}
          </button>
        )}

        <span className="vc-logo" aria-hidden="true" />
        <p className="vc-eyebrow">{t.brand}</p>

        {step === 'intro' && (
          <section className="vc-fade" key="intro">
            <p className="vc-hello">{first ? t.hello.replace('{name}', first) : t.welcome}</p>
            <h1 className="vc-title">{S('intro_headline')}</h1>
            <p className="vc-sub">{S('intro_sub')}</p>

            <div className="vc-rate">
              <p className="vc-ask">
                {staffName ? t.askVisitStaff.replace('{staff}', staffName) : t.askVisit}
              </p>
              <div className="vc-stars" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    aria-label={`${n}`}
                    className={`vc-star ${n <= active ? 'on' : ''}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => pick(n)}
                  >
                    <svg viewBox="0 0 24 24" width="46" height="46">
                      <path d={STAR} />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="vc-rate-label">{active ? t.ratings[active - 1] : t.tapStar}</p>
            </div>

            {showReward && (
              <div className="vc-gift locked">
                <Lock />
                <div className="vc-gift-text">
                  <strong>{t.giftLockedTitle}</strong>
                  <span>{t.giftLockedText}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 'details' && (
          <section className="vc-fade" key="details">
            <h1 className="vc-title">{S('details_headline')}</h1>
            <p className="vc-sub">{S('details_sub')}</p>

            <div className="vc-questions">
              {questions.map((q) => (
                <div className="vc-q" key={q.id}>
                  <label>
                    {lang === 'ar' && q.label_ar ? q.label_ar : q.label}
                    {isRequired(q) ? <em> *</em> : null}
                  </label>
                  <Question
                    q={q}
                    lang={lang}
                    t={t}
                    tone={tone}
                    value={answers[q.id]}
                    onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                  />
                </div>
              ))}
            </div>

            <button type="button" className="vc-btn" disabled={!canSubmit || busy} onClick={submit}>
              {busy ? t.sending : showReward ? t.unlock : t.send}
            </button>
            <button type="button" className="vc-back" onClick={() => setStep('intro')}>
              <span aria-hidden="true">{lang === 'ar' ? '→' : '←'}</span> {t.back}
            </button>
          </section>
        )}

        {step === 'done' && (
          <section className="vc-fade" key="done">
            <h1 className="vc-title">{S('thanks_title')}</h1>
            <p className="vc-sub">{S('thanks_body')}</p>

            {showReward && (
              <div className="vc-gift open">
                <Lock open />
                <div className="vc-gift-text">
                  <strong>{S('reward_title')}</strong>
                  <span>{S('reward_body')}</span>
                  {settings.reward_code ? <b className="vc-code">{settings.reward_code}</b> : null}
                </div>
              </div>
            )}

            {settings.reward_link_url && rewardLabel ? (
              <a className="vc-btn" href={settings.reward_link_url} target="_blank" rel="noopener noreferrer">
                {rewardLabel}
              </a>
            ) : null}

            {showGoogle ? (
              <a className="vc-btn ghost" href={settings.google_review_url} target="_blank" rel="noopener noreferrer">
                {t.google}
              </a>
            ) : null}
          </section>
        )}

        <div className="vc-steps" aria-hidden="true">
          {STEPS.map((name, i) => (
            <i key={name} className={i <= stepIndex ? 'on' : ''} />
          ))}
        </div>
        <p className="vc-foot">Nations of Sky</p>
      </div>
    </main>
  );
}
