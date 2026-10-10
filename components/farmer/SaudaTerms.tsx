// Pakka Sauda: F9 frozen deal terms for the farmer: ladder per mann, range, date, loading, token. Owner: B.
import { DemoBadge } from '@/components/shared/DemoBadge';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { formatRsPK, kgToMann, perKgToPerMann } from '@/lib/format';
import type { Grade, SaudaView } from '@/lib/types';
import { explainSauda } from '@/lib/voice/phrases';
import { urduDate } from '@/lib/voice/urdu-number';

const GRADES: Grade[] = ['A', 'B', 'C'];

export function SaudaTerms({ sauda }: { sauda: SaudaView }) {
  const t = sauda.terms;
  const buyerNameUr = sauda.buyer.name_ur ?? sauda.buyer.name;
  return (
    <section className="flex flex-col gap-3 rounded-3xl border-2 border-stone-200 bg-white p-4">
      <header className="flex items-center justify-between">
        <span className="text-2xl font-bold">{buyerNameUr} صاحب</span>
        <SpeakButton text={explainSauda({ buyerNameUr, collectionDate: t.collection_date, tokenAmount: t.token_amount })} />
      </header>
      <table className="w-full text-xl">
        <tbody>
          {GRADES.map((g) => (
            <tr key={g} className="border-b border-stone-100 last:border-0">
              <td dir="ltr" className="py-1 text-right font-black">{g}</td>
              <td className="py-1 text-left">
                {t.price[g] == null ? (
                  <span className="text-stone-500">نہیں لیں گے</span>
                ) : (
                  <span>
                    <span dir="ltr" className="font-bold tabular-nums">{formatRsPK(perKgToPerMann(t.price[g]!))}</span> / من
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-3 text-xl">
        <span className="text-3xl">🥔</span>
        <span dir="ltr" className="tabular-nums">
          {kgToMann(t.qty_low_kg).toLocaleString('en-IN')} – {kgToMann(t.qty_high_kg).toLocaleString('en-IN')}
        </span>
        من
      </div>
      <div className="flex items-center justify-between text-xl">
        <span>📅 {urduDate(t.collection_date)}</span>
        <span>🚚 {t.loading_paid_by === 'buyer' ? 'خریدار' : 'آپ'}</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-amber-50 p-3">
        <span className="text-lg">ٹوکن</span>
        <span dir="ltr" className="text-4xl font-bold tabular-nums">{formatRsPK(t.token_amount)}</span>
        <DemoBadge />
      </div>
    </section>
  );
}
