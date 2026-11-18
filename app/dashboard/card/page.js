import { requireAdmin } from '@/lib/auth';
import { getBaseUrl } from '@/lib/server-utils';
import PrintCard from '@/components/PrintCard';

export const dynamic = 'force-dynamic';

// One printable card for the whole company: the customer picks the branch in the survey.
export default async function CardPage() {
  await requireAdmin();
  return <PrintCard url={`${getBaseUrl()}/r`} branchName="Nations of Sky" />;
}
