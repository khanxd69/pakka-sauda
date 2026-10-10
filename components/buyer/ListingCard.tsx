// Pakka Sauda: one open listing in the /market grid (D1.2). The whole card links to /market/[id].
import Link from 'next/link';
import { formatDate, formatKg, formatRs, kgToMann, perKgToPerMann } from '@/lib/format';
import type { ListingView } from '@/lib/types';

const rsPerKg = (n: number) => `Rs ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const mann = (kg: number) => kgToMann(kg).toLocaleString('en-US', { maximumFractionDigits: 1 });

export function ListingCard({ listing }: { listing: ListingView }) {
  const l = listing;
  return (
    <Link
      href={`/market/${l.id}`}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold">
          <span aria-hidden="true">🥔</span> Potato, {l.district}
        </h3>
        <span className="rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
          Grade {l.expected_grade} expected
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Quantity</dt>
        <dd>
          {formatKg(l.qty_low_kg)}–{formatKg(l.qty_high_kg)}{' '}
          <span className="text-muted-foreground">
            ({mann(l.qty_low_kg)}–{mann(l.qty_high_kg)} mann)
          </span>
        </dd>
        <dt className="text-muted-foreground">Ready</dt>
        <dd>
          {formatDate(l.ready_from)} – {formatDate(l.ready_to)}
        </dd>
        <dt className="text-muted-foreground">Farmer&apos;s minimum</dt>
        <dd>
          {rsPerKg(l.min_price_per_kg)}/kg{' '}
          <span className="text-muted-foreground">({formatRs(perKgToPerMann(l.min_price_per_kg))}/mann)</span>
        </dd>
        <dt className="text-muted-foreground">Farmer</dt>
        <dd>{l.farmer.name}</dd>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="rounded border border-dashed px-2 py-0.5 text-muted-foreground">Declared by farmer</span>
        <span className="font-medium">
          {l.bid_count} pending {l.bid_count === 1 ? 'bid' : 'bids'}
        </span>
      </div>
    </Link>
  );
}
