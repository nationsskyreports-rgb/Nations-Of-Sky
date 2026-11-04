import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { detectLang } from '@/lib/i18n';
import SurveyFlow from '@/components/SurveyFlow';
import { admin } from '@/lib/supabase-admin';
import { getSettings, getActiveQuestions } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Voice of Customer' };

export default async function VisitSurvey({ params, searchParams }) {
  const { data: visit } = await admin()
    .from('visits')
    .select('token, customer_name, staff_name, branches(active)')
    .eq('token', params.token)
    .maybeSingle();
  const branch = Array.isArray(visit?.branches) ? visit.branches[0] : visit?.branches;
  if (!visit || !branch?.active) notFound();

  const lang = detectLang(searchParams?.l, headers().get('accept-language'));
  const locked = searchParams?.l === 'ar' || searchParams?.l === 'en';
  const [settings, questions] = await Promise.all([getSettings(), getActiveQuestions()]);

  return (
    <SurveyFlow
      token={visit.token}
      customerName={visit.customer_name}
      staffName={visit.staff_name}
      questions={questions}
      settings={settings}
      initialLang={lang}
      langLocked={locked}
    />
  );
}
