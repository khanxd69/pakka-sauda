// Pakka Sauda: one open listing in the wholesaler market grid. Owner: Workstream D.
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatKg, formatRs, kgToMann, perKgToPerMann } from '@/lib/format';
import type { ListingView } from '@/lib/types';

export function GradeBadge({ grade }: { grade: string }) {
  const color = grade === 'A' ? 'bg-green-600' : grade === 'B' ? 'bg-amber-500' : 'bg-red-600';
  return <Badge className={`${color} text-white`}>Grade {grade}</Badge>;
}

export function ListingCard({ listing: l }: { listing: ListingView }) {
  return (
    <Link
      href={`/market/${l.id}`}
      className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:border-green-600 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">🥔 Potato · {l.district}</span>
        <GradeBadge grade={l.expected_grade} />
      </div>
      <div>
        <div className="text-xl font-bold">
          {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
        </div>
        <div className="text-sm text-stone-500">
          {kgToMann(l.qty_low_kg).toLocaleString('en-US')} – {kgToMann(l.qty_high_kg).toLocaleString('en-US')} mann
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-1 text-sm">
        <dt className="text-stone-500">Ready</dt>
        <dd>
          {formatDate(l.ready_from)} – {formatDate(l.ready_to)}
        </dd>
        <dt className="text-stone-500">Farmer&apos;s minimum</dt>
        <dd>
          {formatRs(l.min_price_per_kg)}/kg <span className="text-stone-500">({formatRs(perKgToPerMann(l.min_price_per_kg))}/mann)</span>
        </dd>
        <dt className="text-stone-500">Farmer</dt>
        <dd>{l.farmer.name}</dd>
      </dl>
      <div className="flex items-center justify-between">
        <Badge variant="outline">Declared by farmer</Badge>
        <span className="text-sm text-stone-600">
          {l.bid_count} pending bid{l.bid_count === 1 ? '' : 's'}
        </span>
      </div>
    </Link>
  );
}
