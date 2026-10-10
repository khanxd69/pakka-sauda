// Pakka Sauda: reviewer's disputes queue (oldest first). Owner: Workstream D.
import { DisputeQueue } from '@/components/admin/DisputeQueue';
import { PageHeader } from '@/components/design/PageHeader';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getDisputes } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function DisputesPage() {
  await requireUser('admin');
  const disputes = await getDisputes();
  return (
    <>
      <AutoRefresh />
      <PageHeader title="Disputes" description="The farmer disagrees with the recorded grade. Nothing is loaded until you rule." />
      <DisputeQueue disputes={disputes} />
    </>
  );
}
