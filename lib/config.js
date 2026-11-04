import { UI, UI_TEXT_KEYS } from '@/lib/i18n';

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
  intro_sub: 'One tap. Something is waiting for you.',
  intro_sub_ar: 'ضغطة واحدة. وهناك شيء ينتظرك.',
  details_headline: 'One more thing...',
  details_headline_ar: 'شيء أخير...',
  details_sub: 'A few quick questions to unlock your surprise.',
  details_sub_ar: 'بضعة أسئلة سريعة لتفتح مفاجأتك.',
  thanks_title: 'Thank you',
  thanks_title_ar: 'شكراً لك',
  thanks_body: 'Your feedback goes straight to our management team.',
  thanks_body_ar: 'رأيك يصل مباشرة إلى إدارتنا.',
  reward_enabled: 'true',
  reward_title: 'Your surprise is unlocked',
  reward_title_ar: 'مفاجأتك أصبحت مفتوحة',
  reward_body: 'Thank you for being a valued customer. Stay tuned for exclusive updates from Nations of Sky.',
  reward_body_ar: 'شكراً لأنك عميل مميز لدينا. ترقّب عروضاً حصرية من نيشنز أوف سكاي.',
  reward_code: '',
  reward_link_label: '',
  reward_link_label_ar: '',
  reward_link_url: '',
  google_review_url: '',
  google_min_rating: '5',
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

export const SETTING_GROUPS = [
  {
    title: 'Welcome screen',
    fields: [
      { key: 'intro_headline', label: 'Headline' },
      { key: 'intro_headline_ar', label: 'Headline (Arabic)', rtl: true },
      { key: 'intro_sub', label: 'Sub-headline' },
      { key: 'intro_sub_ar', label: 'Sub-headline (Arabic)', rtl: true },
    ],
  },
  {
    title: 'Questions screen',
    fields: [
      { key: 'details_headline', label: 'Headline' },
      { key: 'details_headline_ar', label: 'Headline (Arabic)', rtl: true },
      { key: 'details_sub', label: 'Sub-headline' },
      { key: 'details_sub_ar', label: 'Sub-headline (Arabic)', rtl: true },
    ],
  },
  {
    title: 'Surprise (unlocked at the end)',
    fields: [
      { key: 'reward_enabled', label: 'Show surprise card', type: 'select', options: ['true', 'false'] },
      { key: 'reward_title', label: 'Title' },
      { key: 'reward_title_ar', label: 'Title (Arabic)', rtl: true },
      { key: 'reward_body', label: 'Text', type: 'textarea' },
      { key: 'reward_body_ar', label: 'Text (Arabic)', type: 'textarea', rtl: true },
      { key: 'reward_code', label: 'Code (optional)' },
      { key: 'reward_link_label', label: 'Button label (optional)' },
      { key: 'reward_link_label_ar', label: 'Button label (Arabic, optional)', rtl: true },
      { key: 'reward_link_url', label: 'Button link (optional)' },
    ],
  },
  {
    title: 'Thank-you screen',
    fields: [
      { key: 'thanks_title', label: 'Title' },
      { key: 'thanks_title_ar', label: 'Title (Arabic)', rtl: true },
      { key: 'thanks_body', label: 'Text', type: 'textarea' },
      { key: 'thanks_body_ar', label: 'Text (Arabic)', type: 'textarea', rtl: true },
    ],
  },
  {
    title: 'Google review',
    fields: [
      { key: 'google_review_url', label: 'Google review link (leave empty to hide)' },
      { key: 'google_min_rating', label: 'Show the Google button from this rating (1-5)' },
    ],
  },
  {
    title: 'WhatsApp',
    fields: [
      {
        key: 'whatsapp_message',
        label: 'Message (English). Use {name}, {link}, {staff}, {branch}',
        type: 'textarea',
      },
      {
        key: 'whatsapp_message_ar',
        label: 'Message (Arabic)',
        type: 'textarea',
        rtl: true,
      },
      { key: 'default_country_code', label: 'Default country code (digits only)' },
    ],
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
      { key: 'color_low', label: 'Score color: low', type: 'color' },
      { key: 'color_mid', label: 'Score color: middle', type: 'color' },
      { key: 'color_high', label: 'Score color: high', type: 'color' },
      { key: 'nps_yellow_from', label: 'Middle color starts at score (1-10)' },
      { key: 'nps_green_from', label: 'High color starts at score (1-10)' },
    ],
  },
  {
    title: 'Survey texts',
    fields: [
      ...UI_TEXT_KEYS.flatMap(([k, label]) => [
        { key: `ui_${k}`, label: `${label} (English). Empty = default: ${UI.en[k]}` },
        { key: `ui_${k}_ar`, label: `${label} (Arabic). Empty = default: ${UI.ar[k]}`, rtl: true },
      ]),
      ...[1, 2, 3, 4, 5].flatMap((n) => [
        { key: `ui_rating_${n}`, label: `${n}-star label (English). Empty = default: ${UI.en.ratings[n - 1]}` },
        { key: `ui_rating_${n}_ar`, label: `${n}-star label (Arabic). Empty = default: ${UI.ar.ratings[n - 1]}`, rtl: true },
      ]),
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
