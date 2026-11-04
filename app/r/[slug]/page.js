import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { detectLang } from '@/lib/i18n';
import SurveyFlow from '@/components/SurveyFlow';
import { admin } from '@/lib/supabase-admin';
import { getSettings, getActiveQuestions } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Voice of Customer' };

export default async function BranchSurvey({ params, searchParams }) {
  const { data: branch } = await admin()
    .from('branches')
    .select('id, slug, active')
    .eq('slug', params.slug)
    .maybeSingle();
  if (!branch || !branch.active) notFound();

  const [settings, questions] = await Promise.all([getSettings(), getActiveQuestions()]);
  const forced = settings.default_language;
  const lang = detectLang(searchParams?.l, headers().get('accept-language'), forced);
  const locked = searchParams?.l === 'ar' || searchParams?.l === 'en' || forced === 'ar' || forced === 'en';

  return <SurveyFlow branchSlug={branch.slug} questions={questions} settings={settings} initialLang={lang} langLocked={locked} />;
}
