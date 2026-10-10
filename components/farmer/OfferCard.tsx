'use client';
// Pakka Sauda: one buyer's offer for the farmer (F8): ladder per mann, net comparison, listen, accept. Owner: B.
import { BadgeCheck, CalendarDays, Check, Store, Truck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { acceptBid, rejectBid } from '@/app/actions/bids';
import { playUrl, schedule } from '@/components/voice/player';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { formatRsPK, perKgToPerMann } from '@/lib/format';
import { compareNet } from '@/lib/net';
import type { BidView, Grade } from '@/lib/types';
import { clipUrl } from '@/lib/voice/clips';
import { explainOffer } from '@/lib/voice/phrases';
import { urduDate } from '@/lib/voice/urdu-number';
import { BigButton } from './BigButton';
import { ConfirmSheet } from './ConfirmSheet';
import { NetCompare } from './NetCompare';

const GRADES: Grade[] = ['A', 'B', 'C'];
const LETTER: Record<Grade, string> = { A: 'bg-success-soft text-success', B: 'bg-warning-soft text-warning', C: 'bg-danger-soft text-danger' };

export function OfferCard({ bid, refPricePerKg }: { bid: BidView; refPricePerKg: number | null }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [busy, setBusy] = useState(false);

  const priceKg: Record<Grade, number | null> = { A: bid.price_a, B: bid.price_b, C: bid.price_c };
  const perMann: Record<Grade, number | null> = {
    A: perKgToPerMann(bid.price_a),
    B: bid.price_b == null ? null : perKgToPerMann(bid.price_b),
    C: bid.price_c == null ? null : perKgToPerMann(bid.price_c),
  };
  const midKg = (bid.listing.qty_low_kg + bid.listing.qty_high_kg) / 2;
  const offerPrice = priceKg[bid.listing.expected_grade] ?? bid.price_a;
  const net = refPricePerKg == null ? null : compareNet(refPricePerKg, offerPrice, bid.loading_paid_by, midKg);
  const buyerNameUr = bid.buyer.name_ur ?? bid.buyer.name;

  async function accept() {
    setBusy(true);
    const res = await acceptBid(bid.id);
    if (res.ok) {
      router.push(`/f/saudas/${res.data.saudaId}`);
      return;
    }
    setBusy(false);
    setConfirming(false);
    void schedule(() => playUrl(clipUrl('error_generic')), 'now');
    router.refresh();
  }

  async function decline() {
    setBusy(true);
    const res = await rejectBid(bid.id);
    setBusy(false);
    setDeclining(false);
    if (!res.ok) void schedule(() => playUrl(clipUrl('error_generic')), 'now');
    router.refresh();
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <header className="flex items-center gap-3 border-b border-line p-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Store className="size-6" strokeWidth={1.5} aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xl font-semibold leading-[1.9] text-ink">{buyerNameUr} صاحب</span>
          {bid.buyer.verified ? (
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success-soft px-2.5 text-sm text-success">
              <BadgeCheck className="size-4" strokeWidth={1.75} aria-hidden />
              تصدیق شدہ
            </span>
          ) : null}
        </div>
        <SpeakButton
          text={explainOffer({
            buyerNameUr,
            verified: bid.buyer.verified,
            perMann,
            loadingPaidBy: bid.loading_paid_by,
            offerTotal: net?.offerTotal ?? 0,
            mandiTotal: net?.mandiTotal ?? 0,
          })}
        />
      </header>

      <div className="flex flex-col gap-4 p-4">
        <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
          {GRADES.map((g) => (
            <li key={g} className="flex items-center gap-3 px-3 py-2.5">
              <span dir="ltr" className={`rounded-md px-2 py-0.5 text-base font-bold ${LETTER[g]}`}>
                {g}
              </span>
              <span className="flex-1" />
              {perMann[g] == null ? (
                <span className="text-lg text-ink-muted">نہیں لیں گے</span>
              ) : (
                <span className="text-lg text-ink-muted">
                  <span dir="ltr" className="text-2xl font-semibold tabular-nums text-ink">
                    {formatRsPK(perMann[g]!)}
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
            {urduDate(bid.collection_date)}
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-subtle px-3 py-2">
            <Truck className="size-5 shrink-0 text-ink-muted" strokeWidth={1.5} aria-hidden />
            {bid.loading_paid_by === 'buyer' ? 'خریدار' : 'آپ'}
          </span>
        </div>

        {net ? <NetCompare net={net} /> : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-line p-4">
        <BigButton variant="go" icon={<Check strokeWidth={2.5} aria-hidden />} onClick={() => setConfirming(true)}>
          قبول کریں
        </BigButton>
        <BigButton variant="plain" icon={<X strokeWidth={2} aria-hidden />} onClick={() => setDeclining(true)}>
          یہ نہیں
        </BigButton>
      </div>

      <ConfirmSheet open={declining} clip="reject_confirm" busy={busy} onYes={decline} onNo={() => setDeclining(false)}>
        <p className="text-center text-xl font-semibold text-ink">{buyerNameUr} صاحب</p>
      </ConfirmSheet>

      <ConfirmSheet open={confirming} clip="accept_confirm" busy={busy} onYes={accept} onNo={() => setConfirming(false)}>
        <p className="text-center text-xl font-semibold text-ink">{buyerNameUr} صاحب</p>
      </ConfirmSheet>
    </article>
  );
}
