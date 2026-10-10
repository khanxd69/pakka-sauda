// Pakka Sauda: reviewer dashboard: tiles and disputes queue. Owner: Workstream D.
import { DisputeQueue } from '@/components/admin/DisputeQueue';
import { ResetDemoButton } from '@/components/admin/ResetDemoButton';
import { StatTiles } from '@/components/admin/StatTiles';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { CONFIG } from '@/lib/config';
import { getAdminStats, getDisputes } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function AdminPage() {
  await requireUser('admin');
  const [stats, disputes] = await Promise.all([getAdminStats(), getDisputes()]);
  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reviewer dashboard</h1>
        {CONFIG.DEMO_MODE ? <ResetDemoButton /> : null}
      </div>
      <DisputeQueue disputes={disputes} />
      <StatTiles stats={stats} />
    </div>
  );
}
