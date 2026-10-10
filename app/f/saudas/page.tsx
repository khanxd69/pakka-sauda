// Pakka Sauda: farmer's sauda list. Owner: Workstream B.
import Link from 'next/link';
import { ScreenTitle } from '@/components/farmer/ScreenTitle';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { formatRsPK, kgToMann } from '@/lib/format';
import { getSaudasForUser } from '@/lib/queries';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import { requireUser } from '@/lib/session';

export default async function FarmerSaudasPage() {
  const user = await requireUser('farmer');
  const saudas = await getSaudasForUser(user);
  return (
    <>
      <AutoRefresh />
      <ScreenTitle>میرے سودے</ScreenTitle>
      {saudas.length === 0 ? <div className="py-16 text-center text-8xl">📭</div> : null}
      <div className="flex flex-col gap-3">
        {saudas.map((s) => (
          <Link
            key={s.id}
            href={`/f/saudas/${s.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border-2 border-stone-200 bg-white p-4 active:scale-[0.98]"
          >
            <span className="flex flex-col">
              <span className="text-xl font-bold">{s.buyer.name_ur ?? s.buyer.name} صاحب</span>
              <span className={`text-lg ${s.status === 'settled' ? 'text-green-700' : s.status === 'cancelled' ? 'text-stone-500' : 'text-amber-700'}`}>
                {STATUS_LABEL[s.status].ur}
              </span>
            </span>
            <span className="flex flex-col items-end" dir="ltr">
              {s.final_amount != null ? (
                <span className="text-2xl font-bold tabular-nums">{formatRsPK(s.final_amount)}</span>
              ) : null}
              <span className="text-base text-stone-600 tabular-nums">
                {kgToMann(s.weighed_kg ?? (s.terms.qty_low_kg + s.terms.qty_high_kg) / 2).toLocaleString('en-IN')} من
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
