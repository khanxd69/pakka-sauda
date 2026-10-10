// Pakka Sauda: F6 reference price card (Lahore, per mann, with source and date). Owner: Workstream B.
import { formatDate, formatRsPK, perKgToPerMann } from '@/lib/format';
import type { ReferencePrice } from '@/lib/types';

export function RefPriceCard({ refPrice }: { refPrice: ReferencePrice | undefined }) {
  if (!refPrice) return null;
  const illustrative = refPrice.source === 'ILLUSTRATIVE';
  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-center">
      <div dir="ltr" className="text-sm font-semibold text-sky-900">
        {illustrative ? 'AMIS' : refPrice.source} {refPrice.market} · {formatDate(refPrice.source_date)}
        {illustrative ? <span className="ml-2 rounded bg-yellow-200 px-1.5 text-xs text-yellow-900">ILLUSTRATIVE</span> : null}
      </div>
      <div className="text-3xl font-bold">
        <span dir="ltr" className="tabular-nums">{formatRsPK(perKgToPerMann(refPrice.price_per_kg))}</span> / من
      </div>
      <div className="text-base text-stone-600">
        <span dir="ltr" className="tabular-nums">{formatRsPK(refPrice.price_per_kg)}</span> / کلو
      </div>
    </div>
  );
}
