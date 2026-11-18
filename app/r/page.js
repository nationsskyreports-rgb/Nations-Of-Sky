import { headers } from 'next/headers';
import { detectLang } from '@/lib/i18n';
import SurveyFlow from '@/components/SurveyFlow';
import { admin } from '@/lib/supabase-admin';
import { getSettings, getActiveQuestions } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Voice of Customer' };

// The single QR code: the customer picks the branch inside the survey.
export default async function BranchPickerSurvey({ searchParams }) {
  const { data: branches } = await admin()
    .from('branches')
    .select('id, name')
    .eq('active', true)
    .order('name');

  const [settings, questions] = await Promise.all([getSettings(), getActiveQuestions()]);
  const forced = settings.default_language;
  const lang = detectLang(searchParams?.l, headers().get('accept-language'), forced);
  const locked = searchParams?.l === 'ar' || searchParams?.l === 'en' || forced === 'ar' || forced === 'en';

  return (
    <SurveyFlow
      branches={branches || []}
      questions={questions}
      settings={settings}
      initialLang={lang}
      langLocked={locked}
    />
  );
}
