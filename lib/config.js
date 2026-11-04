export const TIMEZONE = 'Africa/Cairo';

export const DEFAULT_SETTINGS = {
  intro_headline: "Your visit isn't complete yet.",
  intro_sub: 'One tap. Something is waiting for you.',
  details_headline: 'One more thing...',
  details_sub: 'A few quick questions to unlock your surprise.',
  thanks_title: 'Thank you',
  thanks_body: 'Your feedback goes straight to our management team.',
  reward_enabled: 'true',
  reward_title: 'Your surprise is unlocked',
  reward_body: 'Thank you for being a valued customer. Stay tuned for exclusive updates from Nations of Sky.',
  reward_code: '',
  reward_link_label: '',
  reward_link_url: '',
  google_review_url: '',
  google_min_rating: '5',
  whatsapp_message:
    'Hello {name}, thank you for visiting Nations of Sky today. Could you take a moment to tell us how your visit went? {link}',
  default_country_code: '20',
};

export const SETTING_GROUPS = [
  {
    title: 'Welcome screen',
    fields: [
      { key: 'intro_headline', label: 'Headline' },
      { key: 'intro_sub', label: 'Sub-headline' },
    ],
  },
  {
    title: 'Questions screen',
    fields: [
      { key: 'details_headline', label: 'Headline' },
      { key: 'details_sub', label: 'Sub-headline' },
    ],
  },
  {
    title: 'Surprise (unlocked at the end)',
    fields: [
      { key: 'reward_enabled', label: 'Show surprise card', type: 'select', options: ['true', 'false'] },
      { key: 'reward_title', label: 'Title' },
      { key: 'reward_body', label: 'Text', type: 'textarea' },
      { key: 'reward_code', label: 'Code (optional)' },
      { key: 'reward_link_label', label: 'Button label (optional)' },
      { key: 'reward_link_url', label: 'Button link (optional)' },
    ],
  },
  {
    title: 'Thank-you screen',
    fields: [
      { key: 'thanks_title', label: 'Title' },
      { key: 'thanks_body', label: 'Text', type: 'textarea' },
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
        label: 'Message. Use {name}, {link}, {staff}, {branch}',
        type: 'textarea',
      },
      { key: 'default_country_code', label: 'Default country code (digits only)' },
    ],
  },
];

export const QUESTION_TYPES = [
  { value: 'text', label: 'Free text' },
  { value: 'choice', label: 'Multiple choice' },
  { value: 'yesno', label: 'Yes / No' },
  { value: 'nps', label: 'Score 0-10' },
  { value: 'name', label: 'Customer name' },
  { value: 'phone', label: 'Customer mobile' },
];
