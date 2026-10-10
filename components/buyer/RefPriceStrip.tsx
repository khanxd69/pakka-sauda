// Pakka Sauda: reference price strip for the market (source word always shown, including ILLUSTRATIVE). Owner: D.
import { formatDate, formatRs, perKgToPerMann } from '@/lib/format';
import type { ReferencePrice } from '@/lib/types';

export function RefPriceStrip({ prices }: { prices: ReferencePrice[] }) {
  if (prices.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-950">
      {prices.map((p) => (
        <span key={p.id}>
          <span className={p.source === 'ILLUSTRATIVE' ? 'mr-1 rounded bg-yellow-200 px-1 font-semibold text-yellow-900' : 'mr-1 font-semibold'}>
            {p.source}
          </span>
          AMIS {p.market} potato {formatRs(p.price_per_kg)}/kg ({formatRs(perKgToPerMann(p.price_per_kg))}/mann), {formatDate(p.source_date)}
        </span>
      ))}
    </div>
  );
}
