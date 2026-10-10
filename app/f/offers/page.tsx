// Pakka Sauda: F8 offers, grouped by listing. Owner: Workstream B.
import { Inbox } from 'lucide-react';
import { OfferCard } from '@/components/farmer/OfferCard';
import { PotatoArt } from '@/components/farmer/PotatoArt';
import { PromptHeading } from '@/components/farmer/PromptHeading';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
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
      <div className="flex flex-col gap-5 pt-5">
        <PromptHeading clip={offers.length ? 'offers_intro' : 'offers_none'} autoPlay />
        {offers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface py-12 text-ink-muted">
            <Inbox className="size-12" strokeWidth={1.25} aria-hidden />
          </div>
        ) : null}
        {[...groups.values()].map((bids) => {
          const l = bids[0].listing;
          return (
            <section key={l.id} className="flex flex-col gap-3">
              <h2 className="flex items-center gap-3 text-xl font-semibold text-ink">
                <PotatoArt kind={l.expected_grade} className="size-10 rounded-lg" />
                <span>
                  <span dir="ltr" className="tabular-nums">
                    {kgToMann(l.qty_low_kg).toLocaleString('en-IN')} – {kgToMann(l.qty_high_kg).toLocaleString('en-IN')}
                  </span>{' '}
                  من
                </span>
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
