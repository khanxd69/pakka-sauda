// Pakka Sauda: listing detail and bid form. Owner: Workstream D.
import { notFound } from 'next/navigation';
import { BidForm } from '@/components/buyer/BidForm';
import { ListingFacts } from '@/components/buyer/ListingFacts';
import { RefPriceStrip } from '@/components/buyer/RefPriceStrip';
import { Card } from '@/components/design/Card';
import { PageHeader } from '@/components/design/PageHeader';
import { StatusPill } from '@/components/design/StatusPill';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { formatDate, formatKg } from '@/lib/format';
import { getListing, getMyBids, getReferencePrices } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('wholesaler');
  const listing = /^[0-9a-f-]{36}$/i.test(id) ? await getListing(id) : null;
  if (!listing) notFound();
  const [prices, myBids] = await Promise.all([getReferencePrices(), getMyBids(user.id)]);
  const mine = myBids.filter((b) => b.listing_id === listing.id);
  const existing = mine[0] ?? null;

  return (
    <>
      <AutoRefresh seconds={10} />
      <PageHeader
        back={{ href: '/market', label: 'Market' }}
        title={`${formatKg(listing.qty_low_kg)} – ${formatKg(listing.qty_high_kg)} potato`}
        description={`${listing.farmer.name} · ${listing.district} · ready ${formatDate(listing.ready_from)}`}
      />
      <div className="flex flex-col gap-4">
        <RefPriceStrip prices={prices} />
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_440px]">
          <div className="flex min-w-0 flex-col gap-4">
            <ListingFacts listing={listing} />
            {mine.length > 0 ? (
              <Card title="Your bids on this listing">
                <ul className="flex flex-col divide-y divide-line">
                  {mine.map((b) => (
                    <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm first:pt-0 last:pb-0">
                      <span className="tabular-nums text-ink">
                        A {b.price_a} · B {b.price_b ?? '–'} · C {b.price_c ?? '–'} Rs/kg
                      </span>
                      <span className="text-xs text-ink-muted">
                        Collect {formatDate(b.collection_date)} · loading by {b.loading_paid_by}
                      </span>
                      <StatusPill kind="bid" status={b.status} />
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
          <div className="min-w-0 lg:sticky lg:top-24">
            {listing.status === 'open' ? (
              <BidForm listing={listing} existing={existing} />
            ) : (
              <Card title="Bidding closed">
                <p className="text-sm text-ink-muted">This listing is no longer open for bids.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
