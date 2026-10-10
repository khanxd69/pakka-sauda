// Pakka Sauda: F6 reference price card (Lahore, per mann, with source and date). Owner: Workstream B.
import { LineChart } from 'lucide-react';
import { formatDate, formatRsPK, perKgToPerMann } from '@/lib/format';
import type { ReferencePrice } from '@/lib/types';

export function RefPriceCard({ refPrice }: { refPrice: ReferencePrice | undefined }) {
  if (!refPrice) return null;
  const illustrative = refPrice.source === 'ILLUSTRATIVE';
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
        <LineChart className="size-6" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="flex flex-1 flex-col">
        <span dir="ltr" className="flex flex-wrap items-center justify-end gap-2 text-xs text-ink-muted">
          {illustrative ? 'AMIS' : refPrice.source} {refPrice.market} · {formatDate(refPrice.source_date)}
          {illustrative ? <span className="rounded-full bg-attn-soft px-2 py-0.5 font-medium text-attn">ILLUSTRATIVE</span> : null}
        </span>
        <span className="text-2xl font-semibold text-ink">
          <span dir="ltr" className="tabular-nums">
            {formatRsPK(perKgToPerMann(refPrice.price_per_kg))}
          </span>{' '}
          <span className="text-base font-normal text-ink-muted">/ من</span>
        </span>
        <span className="text-sm text-ink-muted">
          <span dir="ltr" className="tabular-nums">
            {formatRsPK(refPrice.price_per_kg)}
          </span>{' '}
          / کلو
        </span>
      </div>
    </div>
  );
}
