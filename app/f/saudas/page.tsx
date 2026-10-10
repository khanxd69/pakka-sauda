// Pakka Sauda: farmer's sauda list. Owner: Workstream B.
import Link from 'next/link';
import { ChevronLeft, Inbox, Store } from 'lucide-react';
import { StatusPill } from '@/components/design/StatusPill';
import { ScreenTitle } from '@/components/farmer/ScreenTitle';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { formatRsPK, kgToMann } from '@/lib/format';
import { getSaudasForUser } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function FarmerSaudasPage() {
  const user = await requireUser('farmer');
  // Saudas that need the farmer (collected, agreed) first, then the rest in their newest-first order.
  const needs = (st: string) => (st === 'collected' || st === 'agreed' ? 0 : 1);
  const all = await getSaudasForUser(user);
  const saudas = all.filter((s) => s.status !== 'settled').sort((a, b) => needs(a.status) - needs(b.status));
  const settled = all.filter((s) => s.status === 'settled');
  const totalEarned = settled.reduce((sum, s) => sum + (s.final_amount ?? 0), 0); // stored settle() amounts
  return (
    <>
      <AutoRefresh />
      <ScreenTitle>میرے سودے</ScreenTitle>
      {all.length === 0 ? (
        <div className="flex justify-center rounded-2xl border border-dashed border-line-strong bg-surface py-12 text-ink-muted">
          <Inbox className="size-12" strokeWidth={1.25} aria-hidden />
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        {saudas.map((s) => (
          <Link
            key={s.id}
            href={`/f/saudas/${s.id}`}
            className={`flex items-center gap-3 rounded-2xl border bg-surface p-4 shadow-card transition-colors active:scale-[0.99] ${needs(s.status) === 0 ? 'border-brand ring-2 ring-brand/20' : 'border-line'}`}
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Store className="size-6" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-xl font-semibold leading-[1.9] text-ink">{s.buyer.name_ur ?? s.buyer.name} صاحب</span>
              <StatusPill kind="sauda" status={s.status} lang="ur" />
            </span>
            <span className="flex flex-col items-end">
              {s.final_amount != null ? (
                <span dir="ltr" className="text-xl font-semibold tabular-nums text-ink">
                  {formatRsPK(s.final_amount)}
                </span>
              ) : null}
              <span className="text-base text-ink-muted">
                <span dir="ltr" className="tabular-nums">
                  {kgToMann(s.weighed_kg ?? (s.terms.qty_low_kg + s.terms.qty_high_kg) / 2).toLocaleString('en-IN')}
                </span>{' '}
                من
              </span>
            </span>
            <ChevronLeft className="size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden />
          </Link>
        ))}
      </div>
      {settled.length > 0 ? (
        <section className="mt-8 flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-success/25 bg-success-soft p-4">
            <span className="text-xl font-bold text-ink">کل کمائی</span>
            <span dir="ltr" className="text-3xl font-semibold tabular-nums text-ink">
              {formatRsPK(totalEarned)}
            </span>
          </div>
          {settled.map((s) => (
            <Link key={s.id} href={`/f/saudas/${s.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-card">
              <span className="text-lg text-ink">{s.buyer.name_ur ?? s.buyer.name} صاحب</span>
              <span dir="ltr" className="text-xl font-semibold tabular-nums text-ink">
                {s.final_amount != null ? formatRsPK(s.final_amount) : ''}
              </span>
            </Link>
          ))}
        </section>
      ) : null}
    </>
  );
}
