import { UI_TEXT_KEYS } from '@/lib/i18n';

export const TIMEZONE = 'Africa/Cairo';

const uiDefaults = {};
UI_TEXT_KEYS.forEach(([k]) => {
  uiDefaults[`ui_${k}`] = '';
  uiDefaults[`ui_${k}_ar`] = '';
});
for (let i = 1; i <= 5; i++) {
  uiDefaults[`ui_rating_${i}`] = '';
  uiDefaults[`ui_rating_${i}_ar`] = '';
}

export const DEFAULT_SETTINGS = {
  intro_headline: "Your visit isn't complete yet.",
  intro_headline_ar: 'زيارتك لم تكتمل بعد.',
  intro_sub: 'It takes less than 30 seconds.',
  intro_sub_ar: 'يستغرق أقل من 30 ثانية.',
  details_headline: 'One more thing...',
  details_headline_ar: 'شيء أخير...',
  details_sub: 'A few quick questions to complete your feedback.',
  details_sub_ar: 'بضعة أسئلة سريعة لإكمال رأيك.',
  thanks_title: 'Thank you',
  thanks_title_ar: 'شكراً لك',
  thanks_body: 'Your feedback goes straight to our management team.',
  thanks_body_ar: 'رأيك يصل مباشرة إلى إدارتنا.',
  whatsapp_message:
    'Hello {name}, thank you for visiting Nations of Sky today. Could you take a moment to tell us how your visit went? {link}',
  whatsapp_message_ar:
    'مرحباً {name}، شكراً لزيارتك نيشنز أوف سكاي اليوم. هل يمكنك تخصيص دقيقة لتخبرنا كيف كانت زيارتك؟ {link}',
  default_country_code: '20',
  require_name: 'true',
  require_phone: 'true',
  default_language: 'auto',
  show_lang_switch: 'true',
  color_brand: '#b5934c',
  color_bg: '#f2f2f3',
  color_text: '#4d4d4f',
  color_low: '#d64545',
  color_mid: '#e5a812',
  color_high: '#2f9e5b',
  nps_yellow_from: '6',
  nps_green_from: '9',
  ...uiDefaults,
};

const both = (key, label, extra = {}) => [
  { key, label: `${label} (English)`, ...extra },
  { key: `${key}_ar`, label: `${label} (Arabic)`, rtl: true, ...extra },
];

export const SETTING_GROUPS = [
  {
    title: 'Welcome screen',
    fields: [...both('intro_headline', 'Headline'), ...both('intro_sub', 'Sub-headline')],
  },
  {
    title: 'Rating question (stars)',
    fields: [
      ...both('ui_askVisit', 'Question'),
      ...[1, 2, 3, 4, 5].flatMap((n) => both(`ui_rating_${n}`, `${n} star${n > 1 ? 's' : ''} label`)),
    ],
  },
  {
    title: 'Questions screen',
    fields: [...both('details_headline', 'Headline'), ...both('details_sub', 'Sub-headline')],
  },
  {
    title: 'Thank-you screen',
    fields: [...both('thanks_title', 'Title'), ...both('thanks_body', 'Text', { type: 'textarea' })],
  },
  {
    title: 'Required details',
    fields: [
      { key: 'require_name', label: 'Customer name is mandatory', type: 'select', options: ['true', 'false'] },
      { key: 'require_phone', label: 'Customer mobile is mandatory', type: 'select', options: ['true', 'false'] },
    ],
  },
  {
    title: 'Language',
    fields: [
      {
        key: 'default_language',
        label: 'Survey language',
        type: 'select',
        options: [
          { value: 'auto', label: 'Automatic (customer phone language)' },
          { value: 'en', label: 'Always English' },
          { value: 'ar', label: 'Always Arabic' },
        ],
      },
      { key: 'show_lang_switch', label: 'Show the language button', type: 'select', options: ['true', 'false'] },
    ],
  },
  {
    title: 'Colors',
    fields: [
      { key: 'color_brand', label: 'Main color (buttons, borders)', type: 'color' },
      { key: 'color_bg', label: 'Page background', type: 'color' },
      { key: 'color_text', label: 'Text', type: 'color' },
    ],
  },
  {
    title: 'WhatsApp',
    fields: [
      ...both('whatsapp_message', 'Message. Use {name}, {link}, {staff}, {branch}', { type: 'textarea' }),
      { key: 'default_country_code', label: 'Default country code (digits only)' },
    ],
  },
];

export const QUESTION_TYPES = [
  { value: 'text', label: 'Free text' },
  { value: 'choice', label: 'Multiple choice' },
  { value: 'yesno', label: 'Yes / No' },
  { value: 'nps', label: 'Score 1-10 (red, yellow, green)' },
  { value: 'name', label: 'Customer name' },
  { value: 'phone', label: 'Customer mobile' },
];
