// Pakka Sauda: F8 offers, grouped by listing. Owner: Workstream B.
import { OfferCard } from '@/components/farmer/OfferCard';
import { ScreenTitle } from '@/components/farmer/ScreenTitle';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { kgToMann } from '@/lib/format';
import { getOffersForFarmer, getReferencePrices } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import type { BidView } from '@/lib/types';

export default async function OffersPage() {
  const user = await requireUser('farmer');
  const [offers, refs] = await Promise.all([getOffersForFarmer(user.id), getReferencePrices()]);
  const lahore = refs.find((r) => r.market === 'Lahore') ?? refs[0];

  const groups = new Map<string, BidView[]>();
  for (const b of offers) groups.set(b.listing_id, [...(groups.get(b.listing_id) ?? []), b]);

  return (
    <>
      <AutoRefresh />
      <ScreenTitle audio={<AudioPrompt clip={offers.length ? 'offers_intro' : 'offers_none'} autoPlay />}>بولیاں</ScreenTitle>
      {offers.length === 0 ? <div className="py-16 text-center text-8xl">📭</div> : null}
      <div className="flex flex-col gap-8">
        {[...groups.values()].map((bids) => {
          const l = bids[0].listing;
          return (
            <section key={l.id} className="flex flex-col gap-4">
              <h2 className="flex items-center gap-3 text-xl font-bold">
                <span className="text-3xl">🥔</span>
                <span dir="ltr" className="tabular-nums">
                  {kgToMann(l.qty_low_kg).toLocaleString('en-IN')} – {kgToMann(l.qty_high_kg).toLocaleString('en-IN')}
                </span>
                من
              </h2>
              {bids.map((b) => (
                <OfferCard key={b.id} bid={b} refPricePerKg={lahore?.price_per_kg ?? null} />
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
