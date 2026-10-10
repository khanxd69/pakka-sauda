// Pakka Sauda: open disputes, oldest first; each links to the evidence and ruling page. Owner: Workstream D.
import Link from 'next/link';
import { formatKg, formatRs } from '@/lib/format';
import type { SaudaView } from '@/lib/types';

export function DisputeQueue({ disputes }: { disputes: SaudaView[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-semibold">Disputes queue</h2>
      {disputes.length === 0 ? <p className="text-sm text-stone-500">No open disputes.</p> : null}
      {disputes.map((d) => (
        <Link
          key={d.id}
          href={`/admin/disputes/${d.id}`}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 hover:border-red-400 hover:bg-red-50"
        >
          <span className="font-medium">
            {d.farmer.name} ↔ {d.buyer.business_name ?? d.buyer.name}
          </span>
          <span className="text-sm text-stone-600">
            {d.weighed_kg != null ? formatKg(d.weighed_kg) : ''} · buyer says {d.delivered_grade}, farmer says {d.farmer_claimed_grade}
            {d.final_amount != null ? ` · recorded ${formatRs(d.final_amount)}` : ''}
          </span>
          <span className="text-sm font-semibold text-red-700">Review →</span>
        </Link>
      ))}
    </section>
  );
}
