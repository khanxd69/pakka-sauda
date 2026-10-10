// Pakka Sauda: admin KPI cards and the sauda-status distribution, from getAdminStats() and existing queries. Owner: D.
import { AlertTriangle, Banknote, BadgeCheck, Handshake, Receipt, Sprout } from 'lucide-react';
import { Card } from '@/components/design/Card';
import { StatCard } from '@/components/design/StatCard';
import { formatRs } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import type { AdminStats, SaudaStatus } from '@/lib/types';

const BAR: Record<SaudaStatus, string> = {
  token_due: 'bg-warning',
  awaiting_collection: 'bg-info',
  collected: 'bg-attn',
  disputed: 'bg-danger',
  agreed: 'bg-brand',
  settled: 'bg-success',
  cancelled: 'bg-line-strong',
};

export function StatTiles({ stats, verifiedBuyers, settledSeries }: { stats: AdminStats; verifiedBuyers: number; settledSeries: number[] }) {
  const open = stats.by_status.token_due + stats.by_status.awaiting_collection + stats.by_status.collected + stats.by_status.disputed + stats.by_status.agreed;
  const total = Object.values(stats.by_status).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <StatCard emphasis className="col-span-2 sm:col-span-1" label="Settled deal value" value={formatRs(stats.settled_value)} icon={<Banknote strokeWidth={1.5} />} spark={settledSeries.length > 1 ? settledSeries : undefined} sub="Sum of final amounts on settled saudas" />
        <StatCard emphasis className="col-span-2 sm:col-span-1" label="Fee revenue" value={formatRs(stats.fee_revenue)} icon={<Receipt strokeWidth={1.5} />} sub="1% paid by buyers, counted only when settled" />
        <StatCard label="Open saudas" value={open} icon={<Handshake strokeWidth={1.5} />} sub="Token due to agreed" />
        <StatCard label="Open disputes" value={stats.open_disputes} icon={<AlertTriangle strokeWidth={1.5} />} />
        <StatCard label="Active listings" value={stats.active_listings} icon={<Sprout strokeWidth={1.5} />} />
        <StatCard label="Verified buyers" value={`${verifiedBuyers} / ${stats.wholesalers}`} icon={<BadgeCheck strokeWidth={1.5} />} sub={`${stats.farmers} farmers on the platform`} />
      </div>
      <Card title="Saudas by status" description={`${total} in total`}>
        <div className="flex flex-col gap-4">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-subtle" aria-hidden>
            {(Object.keys(stats.by_status) as SaudaStatus[]).map((s) =>
              stats.by_status[s] > 0 ? <span key={s} className={BAR[s]} style={{ width: `${(stats.by_status[s] / Math.max(total, 1)) * 100}%` }} /> : null,
            )}
          </div>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {(Object.keys(stats.by_status) as SaudaStatus[]).map((s) => (
              <li key={s} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-ink-muted">
                  <span className={`size-2 rounded-full ${BAR[s]}`} aria-hidden />
                  {STATUS_LABEL[s].en}
                </span>
                <span className="tabular-nums text-ink">{stats.by_status[s]}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
