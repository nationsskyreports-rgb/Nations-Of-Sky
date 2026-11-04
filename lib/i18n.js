export const UI = {
  en: {
    brand: 'Voice of Customer',
    hello: 'Hello {name}',
    welcome: 'Welcome',
    askVisit: 'How was your visit?',
    askVisitStaff: 'How was your visit with {staff}?',
    tapStar: 'Tap a star',
    ratings: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
    giftLockedTitle: 'A surprise is waiting for you',
    giftLockedText: 'Unlocks right after your feedback',
    unlock: 'Unlock my surprise',
    send: 'Send feedback',
    sending: 'Sending...',
    notLikely: 'Not likely',
    veryLikely: 'Very likely',
    yes: 'Yes',
    no: 'No',
    google: 'Share your experience on Google',
    back: 'Back',
    switchTo: 'العربية',
    inactiveTitle: 'This link is no longer active.',
    inactiveText: 'Please ask our team for a new one.',
  },
  ar: {
    brand: 'صوت العميل',
    hello: 'مرحباً {name}',
    welcome: 'أهلاً بك',
    askVisit: 'كيف كانت زيارتك؟',
    askVisitStaff: 'كيف كانت زيارتك مع {staff}؟',
    tapStar: 'اضغط على نجمة',
    ratings: ['سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'],
    giftLockedTitle: 'مفاجأة في انتظارك',
    giftLockedText: 'تُفتح فور إرسال رأيك',
    unlock: 'افتح مفاجأتي',
    send: 'إرسال رأيك',
    sending: 'جارٍ الإرسال...',
    notLikely: 'غير محتمل',
    veryLikely: 'محتمل جداً',
    yes: 'نعم',
    no: 'لا',
    google: 'شاركنا تجربتك على Google',
    back: 'رجوع',
    switchTo: 'English',
    inactiveTitle: 'هذا الرابط لم يعد متاحاً.',
    inactiveText: 'يرجى طلب رابط جديد من فريقنا.',
  },
};

// ?l=ar or ?l=en wins, otherwise the browser language decides.
export function detectLang(param, acceptLanguage, forced) {
  if (param === 'ar' || param === 'en') return param;
  if (forced === 'ar' || forced === 'en') return forced;
  return String(acceptLanguage || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

// Editable interface texts: settings key -> default per language.
export const UI_TEXT_KEYS = [
  ['brand', 'Top label'],
  ['hello', 'Greeting with name. Use {name}'],
  ['welcome', 'Greeting without name'],
  ['askVisit', 'Rating question'],
  ['askVisitStaff', 'Rating question with staff name. Use {staff}'],
  ['tapStar', 'Hint under the stars'],
  ['giftLockedTitle', 'Locked surprise title'],
  ['giftLockedText', 'Locked surprise text'],
  ['unlock', 'Submit button (when surprise is on)'],
  ['send', 'Submit button (no surprise)'],
  ['sending', 'Submit button while sending'],
  ['back', 'Back button'],
  ['notLikely', 'Score scale, low end'],
  ['veryLikely', 'Score scale, high end'],
  ['yes', 'Yes button'],
  ['no', 'No button'],
  ['google', 'Google review button'],
];

// Merge admin overrides (settings.ui_<key>, settings.ui_<key>_ar, settings.ui_rating_<n>[_ar]) over the defaults.
export function buildText(settings, lang) {
  const base = UI[lang];
  const sfx = lang === 'ar' ? '_ar' : '';
  const out = { ...base };
  UI_TEXT_KEYS.forEach(([k]) => {
    const v = settings?.[`ui_${k}${sfx}`];
    if (v && String(v).trim()) out[k] = String(v).trim();
  });
  out.ratings = base.ratings.map((d, i) => {
    const v = settings?.[`ui_rating_${i + 1}${sfx}`];
    return v && String(v).trim() ? String(v).trim() : d;
  });
  return out;
}
