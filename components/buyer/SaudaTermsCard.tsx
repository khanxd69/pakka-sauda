// Pakka Sauda: frozen sauda terms for the wholesaler. Owner: Workstream D.
import { DemoBadge } from '@/components/shared/DemoBadge';
import { formatDate, formatKg, formatRs } from '@/lib/format';
import type { SaudaView } from '@/lib/types';
import { GradeBadge } from './ListingCard';

export function SaudaTermsCard({ sauda }: { sauda: SaudaView }) {
  const t = sauda.terms;
  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-semibold">Terms (locked at acceptance)</h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-stone-500">Farmer</dt>
        <dd>
          {sauda.farmer.name} · {sauda.listing.district}
        </dd>
        <dt className="text-stone-500">Ladder (Rs/kg)</dt>
        <dd className="font-semibold">
          A {t.price.A ?? 'not accepted'} · B {t.price.B ?? 'not accepted'} · C {t.price.C ?? 'not accepted'}
        </dd>
        <dt className="text-stone-500">Quantity</dt>
        <dd>
          {formatKg(t.qty_low_kg)} – {formatKg(t.qty_high_kg)}
        </dd>
        <dt className="text-stone-500">Expected grade</dt>
        <dd>
          <GradeBadge grade={t.expected_grade} />
        </dd>
        <dt className="text-stone-500">Collection date</dt>
        <dd>{formatDate(t.collection_date)}</dd>
        <dt className="text-stone-500">Loading paid by</dt>
        <dd className="capitalize">{t.loading_paid_by}</dd>
        <dt className="text-stone-500">Token</dt>
        <dd className="flex items-center gap-2">
          {formatRs(t.token_amount)} <DemoBadge />
        </dd>
        <dt className="text-stone-500">Platform fee</dt>
        <dd>{t.fee_percent}% (paid by buyer on settlement)</dd>
      </dl>
    </section>
  );
}
