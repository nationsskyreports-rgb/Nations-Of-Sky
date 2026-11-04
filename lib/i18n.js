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
    switchTo: 'English',
    inactiveTitle: 'هذا الرابط لم يعد متاحاً.',
    inactiveText: 'يرجى طلب رابط جديد من فريقنا.',
  },
};

// ?l=ar or ?l=en wins, otherwise the browser language decides.
export function detectLang(param, acceptLanguage) {
  if (param === 'ar' || param === 'en') return param;
  return String(acceptLanguage || '').toLowerCase().startsWith('ar') ? 'ar' : 'en';
}
