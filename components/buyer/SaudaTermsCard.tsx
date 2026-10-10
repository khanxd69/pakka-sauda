// Pakka Sauda: frozen sauda terms for the wholesaler. Owner: Workstream D.
import { Card } from '@/components/design/Card';
import { KeyValueList } from '@/components/design/KeyValueList';
import { MoneyCell } from '@/components/design/MoneyCell';
import { formatDate, formatKg, formatRs } from '@/lib/format';
import type { Grade, SaudaView } from '@/lib/types';
import { GradeBadge } from './ListingCard';

const GRADES: Grade[] = ['A', 'B', 'C'];

export function SaudaTermsCard({ sauda }: { sauda: SaudaView }) {
  const t = sauda.terms;
  return (
    <Card title="Terms" description="Locked when the farmer accepted">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-line">
          {GRADES.map((g) => (
            <div key={g} className="flex flex-col gap-1 border-e border-line p-3 last:border-e-0">
              <span className="text-xs font-medium text-ink-muted">Grade {g}</span>
              <span className={`text-lg font-semibold tabular-nums ${t.price[g] == null ? 'text-ink-muted' : 'text-ink'}`}>
                {t.price[g] == null ? '—' : formatRs(t.price[g]!)}
              </span>
              <span className="text-[11px] text-ink-muted">{t.price[g] == null ? 'Not accepted' : 'per kg'}</span>
            </div>
          ))}
        </div>
        <KeyValueList
          items={[
            { label: 'Farmer', value: `${sauda.farmer.name} · ${sauda.listing.district}` },
            { label: 'Quantity', value: `${formatKg(t.qty_low_kg)} – ${formatKg(t.qty_high_kg)}`, numeric: true },
            { label: 'Expected grade', value: <GradeBadge grade={t.expected_grade} /> },
            { label: 'Collection date', value: formatDate(t.collection_date) },
            { label: 'Loading paid by', value: <span className="capitalize">{t.loading_paid_by}</span> },
            { label: 'Token', value: <MoneyCell amount={t.token_amount} demo />, numeric: true },
            { label: 'Platform fee', value: `${t.fee_percent}% (buyer, on settlement)` },
          ]}
        />
      </div>
    </Card>
  );
}
