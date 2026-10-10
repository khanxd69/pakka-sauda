// Pakka Sauda: open listings in the market: a table on desktop, cards on mobile. Owner: Workstream D.
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { Avatar } from '@/components/design/Avatar';
import { num, th } from '@/components/design/DataTable';
import { Pill, type Tone } from '@/components/design/Pill';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatKg, formatRs, kgToMann, perKgToPerMann } from '@/lib/format';
import type { ListingView } from '@/lib/types';

const GRADE_TONE: Record<string, Tone> = { A: 'success', B: 'warning', C: 'danger' };

export function GradeBadge({ grade }: { grade: string }) {
  return <Pill tone={GRADE_TONE[grade] ?? 'neutral'}>Grade {grade}</Pill>;
}

const mann = (kg: number) => kgToMann(kg).toLocaleString('en-US');

export function ListingCard({ listing: l }: { listing: ListingView }) {
  return (
    <Link href={`/market/${l.id}`} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong">
      <div className="flex items-center gap-3">
        <Avatar name={l.farmer.name} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-ink">{l.farmer.name}</span>
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="size-3" strokeWidth={1.5} aria-hidden />
            {l.district}
          </span>
        </div>
        <GradeBadge grade={l.expected_grade} />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold tabular-nums text-ink">
          {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
        </span>
        <span className="text-xs tabular-nums text-ink-muted">
          {mann(l.qty_low_kg)}–{mann(l.qty_high_kg)} mann
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-xs">
        <div className="flex flex-col">
          <span className="text-ink-muted">Ready</span>
          <span className="text-ink">{formatDate(l.ready_from)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-ink-muted">Minimum</span>
          <span className="tabular-nums text-ink">{formatRs(l.min_price_per_kg)}/kg</span>
        </div>
        <div className="flex flex-col">
          <span className="text-ink-muted">Bids</span>
          <span className="tabular-nums text-ink">{l.bid_count}</span>
        </div>
      </div>
    </Link>
  );
}

export function ListingsTable({ listings }: { listings: ListingView[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={th}>Farmer</TableHead>
          <TableHead className={th}>Quantity</TableHead>
          <TableHead className={th}>Grade</TableHead>
          <TableHead className={th}>Ready</TableHead>
          <TableHead className={`${th} text-right`}>Minimum</TableHead>
          <TableHead className={`${th} text-right`}>Bids</TableHead>
          <TableHead className={th}>
            <span className="sr-only">Action</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listings.map((l) => (
          <TableRow key={l.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar name={l.farmer.name} size="sm" />
                <div className="flex flex-col">
                  <span className="font-medium text-ink">{l.farmer.name}</span>
                  <span className="text-xs text-ink-muted">{l.district} · declared by farmer</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col tabular-nums">
                <span className="text-ink">
                  {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
                </span>
                <span className="text-xs text-ink-muted">
                  {mann(l.qty_low_kg)}–{mann(l.qty_high_kg)} mann
                </span>
              </div>
            </TableCell>
            <TableCell>
              <GradeBadge grade={l.expected_grade} />
            </TableCell>
            <TableCell className="text-ink">
              {formatDate(l.ready_from)} – {formatDate(l.ready_to)}
            </TableCell>
            <TableCell className={num}>
              <div className="flex flex-col">
                <span className="text-ink">{formatRs(l.min_price_per_kg)}/kg</span>
                <span className="text-xs text-ink-muted">{formatRs(perKgToPerMann(l.min_price_per_kg))}/mann</span>
              </div>
            </TableCell>
            <TableCell className={num}>{l.bid_count}</TableCell>
            <TableCell className="text-right">
              <Link
                href={`/market/${l.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 text-[13px] font-medium text-white transition-colors hover:bg-brand-hover"
              >
                Place bid
                <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
