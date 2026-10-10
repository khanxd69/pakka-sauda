'use client';
// Pakka Sauda: one buyer's offer for the farmer (F8): ladder per mann, net comparison, listen, accept. Owner: B.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { acceptBid } from '@/app/actions/bids';
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

export function OfferCard({ bid, refPricePerKg }: { bid: BidView; refPricePerKg: number | null }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
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

  return (
    <article className="flex flex-col gap-4 rounded-3xl border-2 border-stone-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{buyerNameUr} صاحب</span>
          {bid.buyer.verified ? <span className="self-start rounded-full bg-green-100 px-3 text-lg text-green-800">✓</span> : null}
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

      <table className="w-full text-xl">
        <tbody>
          {GRADES.map((g) => (
            <tr key={g} className="border-b border-stone-100 last:border-0">
              <td className="py-2">
                <span dir="ltr" className={`inline-flex h-10 w-10 items-center justify-center rounded-lg font-black text-white ${g === 'A' ? 'bg-green-600' : g === 'B' ? 'bg-amber-500' : 'bg-red-600'}`}>
                  {g}
                </span>
              </td>
              <td className="py-2 text-left">
                {perMann[g] == null ? (
                  <span className="text-stone-500">نہیں لیں گے</span>
                ) : (
                  <span>
                    <span dir="ltr" className="font-bold tabular-nums">{formatRsPK(perMann[g]!)}</span> / من
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between text-lg">
        <span>📅 {urduDate(bid.collection_date)}</span>
        <span>🚚 {bid.loading_paid_by === 'buyer' ? 'خریدار' : 'آپ'}</span>
      </div>

      {net ? <NetCompare net={net} /> : null}

      <BigButton variant="go" icon="✓" onClick={() => setConfirming(true)}>
        قبول کریں
      </BigButton>

      <ConfirmSheet open={confirming} clip="accept_confirm" busy={busy} onYes={accept} onNo={() => setConfirming(false)}>
        <p className="text-center text-2xl font-bold">{buyerNameUr} صاحب</p>
      </ConfirmSheet>
    </article>
  );
}
