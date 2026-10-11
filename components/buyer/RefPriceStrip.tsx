// Pakka Sauda: reference price strip (source word always shown, including ILLUSTRATIVE). Owner: Workstream D.
import { LineChart } from 'lucide-react';
import { Pill } from '@/components/design/Pill';
import { formatDate, formatRs, perKgToPerMann } from '@/lib/format';
import type { ReferencePrice } from '@/lib/types';

export function RefPriceStrip({ prices }: { prices: ReferencePrice[] }) {
  if (prices.length === 0) return null;
  return (
    <div className="flex flex-wrap items-stretch overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex w-full items-center gap-2 border-b border-line bg-subtle px-4 py-3 text-[13px] font-medium text-ink-muted sm:w-auto sm:border-e sm:border-b-0">
        <LineChart className="size-4" strokeWidth={1.5} aria-hidden />
        Reference prices · potato
      </div>
      {prices.map((p) => (
        <div key={p.id} className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 border-e border-line px-4 py-3 last:border-e-0">
          <span className="text-sm font-medium text-ink">AMIS {p.market}</span>
          <span className="text-sm tabular-nums text-ink">{formatRs(p.price_per_kg)}/kg</span>
          <span className="text-xs tabular-nums text-ink-muted">{formatRs(perKgToPerMann(p.price_per_kg))}/mann</span>
          <span className="text-xs text-ink-muted">{formatDate(p.source_date)}</span>
          <Pill tone={p.source === 'ILLUSTRATIVE' ? 'attn' : 'info'}>{p.source}</Pill>
        </div>
      ))}
    </div>
  );
}
