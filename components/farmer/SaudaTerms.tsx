// Pakka Sauda: F9 frozen deal terms for the farmer: ladder per mann, range, date, loading, token. Owner: B.
import { CalendarDays, Store, Truck } from 'lucide-react';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { formatRsPK, kgToMann, perKgToPerMann } from '@/lib/format';
import type { Grade, SaudaView } from '@/lib/types';
import { explainSauda } from '@/lib/voice/phrases';
import { urduDate } from '@/lib/voice/urdu-number';

const GRADES: Grade[] = ['A', 'B', 'C'];
const LETTER: Record<Grade, string> = { A: 'bg-success-soft text-success', B: 'bg-warning-soft text-warning', C: 'bg-danger-soft text-danger' };

export function SaudaTerms({ sauda }: { sauda: SaudaView }) {
  const t = sauda.terms;
  const buyerNameUr = sauda.buyer.name_ur ?? sauda.buyer.name;
  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <header className="flex items-center gap-3 border-b border-line p-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Store className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
        <span className="flex-1 text-xl font-semibold leading-[1.9] text-ink">{buyerNameUr} صاحب</span>
        <SpeakButton text={explainSauda({ buyerNameUr, collectionDate: t.collection_date, tokenAmount: t.token_amount })} />
      </header>
      <div className="flex flex-col gap-4 p-4">
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {GRADES.map((g) => (
            <li key={g} className="flex items-center gap-3 px-3 py-2">
              <span dir="ltr" className={`rounded-md px-2 py-0.5 text-base font-bold ${LETTER[g]}`}>
                {g}
              </span>
              <span className="flex-1" />
              {t.price[g] == null ? (
                <span className="text-lg text-ink-muted">نہیں لیں گے</span>
              ) : (
                <span className="text-lg text-ink-muted">
                  <span dir="ltr" className="text-xl font-semibold tabular-nums text-ink">
                    {formatRsPK(perKgToPerMann(t.price[g]!))}
                  </span>{' '}
                  / من
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-3 text-lg">
          <span className="flex items-center gap-2 rounded-xl bg-subtle px-3 py-2">
            <CalendarDays className="size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden />
            {urduDate(t.collection_date)}
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-subtle px-3 py-2">
            <Truck className="size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden />
            {t.loading_paid_by === 'buyer' ? 'خریدار' : 'آپ'}
          </span>
        </div>
        <div className="text-lg text-ink-muted">
          <span dir="ltr" className="tabular-nums">
            {kgToMann(t.qty_low_kg).toLocaleString('en-IN')} – {kgToMann(t.qty_high_kg).toLocaleString('en-IN')}
          </span>{' '}
          من
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-attn/25 bg-attn-soft p-3">
          <span className="text-lg text-ink">ٹوکن</span>
          <span className="flex flex-col items-end gap-1">
            <span dir="ltr" className="text-2xl font-semibold tabular-nums text-ink">
              {formatRsPK(t.token_amount)}
            </span>
            <DemoBadge />
          </span>
        </div>
      </div>
    </section>
  );
}
