import { notFound } from 'next/navigation';
import { admin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth';
import { getBaseUrl } from '@/lib/server-utils';
import PrintCard from '@/components/PrintCard';

export const dynamic = 'force-dynamic';

export default async function CardPage({ params }) {
  await requireAdmin();
  const { data: branch } = await admin().from('branches').select('id, name, slug').eq('id', params.id).maybeSingle();
  if (!branch) notFound();

  return <PrintCard url={`${getBaseUrl()}/r/${branch.slug}`} branchName={branch.name} />;
}
