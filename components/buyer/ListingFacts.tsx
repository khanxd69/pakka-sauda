// Pakka Sauda: farmer-declared facts on the listing detail page. Owner: Workstream D.
import { Badge } from '@/components/ui/badge';
import { formatDate, formatKg, formatRs, kgToMann, perKgToPerMann } from '@/lib/format';
import type { ListingView } from '@/lib/types';
import { GradeBadge } from './ListingCard';

export function ListingFacts({ listing: l }: { listing: ListingView }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">🥔 Potato · {l.district}</h1>
        <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900">
          Declared by farmer, not inspected
        </Badge>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-stone-500">Farmer</dt>
        <dd>
          {l.farmer.name} {l.farmer.verified ? <span className="text-green-700">✓</span> : null}
        </dd>
        <dt className="text-stone-500">Quantity</dt>
        <dd>
          <span className="font-semibold">
            {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
          </span>{' '}
          <span className="text-stone-500">
            ({kgToMann(l.qty_low_kg).toLocaleString('en-US')} – {kgToMann(l.qty_high_kg).toLocaleString('en-US')} mann)
          </span>
        </dd>
        <dt className="text-stone-500">Expected grade</dt>
        <dd>
          <GradeBadge grade={l.expected_grade} />
        </dd>
        <dt className="text-stone-500">Ready</dt>
        <dd>
          {formatDate(l.ready_from)} – {formatDate(l.ready_to)}
        </dd>
        <dt className="text-stone-500">Farmer&apos;s minimum</dt>
        <dd>
          {formatRs(l.min_price_per_kg)}/kg ({formatRs(perKgToPerMann(l.min_price_per_kg))}/mann) for grade {l.expected_grade}
        </dd>
        <dt className="text-stone-500">Status</dt>
        <dd className="capitalize">{l.status}</dd>
      </dl>
    </section>
  );
}
