// Pakka Sauda: reference price strip (D1.2). Always shows the source word (AMIS Punjab or ILLUSTRATIVE) and the date.
import { formatDate, formatRs, perKgToPerMann } from '@/lib/format';
import type { ReferencePrice } from '@/lib/types';

// Per-kg prices can have paise (e.g. 72.45), which formatRs would round away.
const rsPerKg = (n: number) => `Rs ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export function RefPriceStrip({ prices }: { prices: ReferencePrice[] }) {
  if (prices.length === 0) return null;
  return (
    <section aria-label="Reference prices" className="flex flex-wrap gap-2">
      {prices.map((p) => {
        const illustrative = p.source !== 'AMIS Punjab';
        return (
          <p
            key={p.id}
            className={`rounded-lg border px-3 py-2 text-sm ${illustrative ? 'border-amber-300 bg-amber-50' : 'bg-muted'}`}
          >
            <span className="font-semibold">{illustrative ? p.source : 'AMIS'}</span> {p.market} {p.crop}{' '}
            {rsPerKg(p.price_per_kg)}/kg ({formatRs(perKgToPerMann(p.price_per_kg))}/mann), {formatDate(p.source_date)}
            {p.source_price != null && (
              <span className="text-muted-foreground">
                {' '}· published Rs {p.source_price.toLocaleString('en-US')} per {p.source_unit}
              </span>
            )}
          </p>
        );
      })}
    </section>
  );
}
