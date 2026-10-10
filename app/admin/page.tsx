// Pakka Sauda: reviewer dashboard: tiles and disputes queue. Owner: Workstream D.
import { DisputeQueue } from '@/components/admin/DisputeQueue';
import { StatTiles } from '@/components/admin/StatTiles';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getAdminStats, getDisputes } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function AdminPage() {
  await requireUser('admin');
  const [stats, disputes] = await Promise.all([getAdminStats(), getDisputes()]);
  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh />
      <h1 className="text-2xl font-bold">Reviewer dashboard</h1>
      <DisputeQueue disputes={disputes} />
      <StatTiles stats={stats} />
    </div>
  );
}
