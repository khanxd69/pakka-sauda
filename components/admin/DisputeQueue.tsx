// Pakka Sauda: saudas that need the reviewer (disputes first), each linking to its page. Owner: Workstream D.
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/components/design/Avatar';
import { EmptyState } from '@/components/design/EmptyState';
import { StatusPill } from '@/components/design/StatusPill';
import { formatKg, formatRs } from '@/lib/format';
import type { SaudaView } from '@/lib/types';

export function DisputeQueue({ disputes }: { disputes: SaudaView[] }) {
  if (disputes.length === 0) {
    return <EmptyState icon={<CheckCircle2 strokeWidth={1.5} />} title="No open disputes" description="Disputed collections appear here, oldest first." />;
  }
  return (
    <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      {disputes.map((d) => (
        <li key={d.id}>
          <Link href={`/admin/disputes/${d.id}`} className="group flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-subtle/60">
            <Avatar name={d.farmer.name} size="sm" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-ink">
                {d.farmer.name} ↔ {d.buyer.business_name ?? d.buyer.name}
              </span>
              <span className="text-xs tabular-nums text-ink-muted">
                {d.weighed_kg != null ? formatKg(d.weighed_kg) : ''} · buyer says {d.delivered_grade}, farmer says {d.farmer_claimed_grade}
                {d.final_amount != null ? ` · recorded ${formatRs(d.final_amount)}` : ''}
              </span>
            </div>
            <StatusPill kind="sauda" status={d.status} />
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-brand">
              Review
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
