// Pakka Sauda: farmer-declared facts on the listing detail page. Owner: Workstream D.
import { Info } from 'lucide-react';
import { Avatar } from '@/components/design/Avatar';
import { Card } from '@/components/design/Card';
import { KeyValueList } from '@/components/design/KeyValueList';
import { Pill } from '@/components/design/Pill';
import { StatusPill } from '@/components/design/StatusPill';
import { formatDate, formatKg, formatRs, kgToMann, perKgToPerMann } from '@/lib/format';
import type { ListingView } from '@/lib/types';
import { GradeBadge } from './ListingCard';

export function ListingFacts({ listing: l }: { listing: ListingView }) {
  return (
    <Card
      title="Listing"
      description="Declared by farmer, not inspected"
      actions={<StatusPill kind="listing" status={l.status} />}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Avatar name={l.farmer.name} size="lg" />
          <div className="flex flex-col">
            <span className="flex items-center gap-2 text-base font-semibold text-ink">
              {l.farmer.name}
              {l.farmer.verified ? (
                <Pill tone="success" dot>
                  Verified
                </Pill>
              ) : null}
            </span>
            <span className="text-[13px] text-ink-muted">Potato · {l.district}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-lg bg-subtle p-4">
          <span className="text-xs font-medium text-ink-muted">Estimated quantity</span>
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
          </span>
          <span className="text-[13px] tabular-nums text-ink-muted">
            {kgToMann(l.qty_low_kg).toLocaleString('en-US')} – {kgToMann(l.qty_high_kg).toLocaleString('en-US')} mann
          </span>
        </div>
        <KeyValueList
          items={[
            { label: 'Expected grade', value: <GradeBadge grade={l.expected_grade} /> },
            { label: 'Ready window', value: `${formatDate(l.ready_from)} – ${formatDate(l.ready_to)}` },
            {
              label: `Farmer's minimum (grade ${l.expected_grade})`,
              value: `${formatRs(l.min_price_per_kg)}/kg · ${formatRs(perKgToPerMann(l.min_price_per_kg))}/mann`,
              numeric: true,
              strong: true,
            },
          ]}
        />
        <p className="flex items-start gap-2 text-xs text-ink-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          Quantity and grade are the farmer&apos;s estimate. You pay for the kg weighed at collection, at your price for the grade recorded.
        </p>
      </div>
    </Card>
  );
}
