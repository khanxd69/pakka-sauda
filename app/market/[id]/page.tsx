// Pakka Sauda: listing detail and bid form. Owner: Workstream D.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BidForm } from '@/components/buyer/BidForm';
import { ListingFacts } from '@/components/buyer/ListingFacts';
import { RefPriceStrip } from '@/components/buyer/RefPriceStrip';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
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
    <div className="flex flex-col gap-4">
      <AutoRefresh seconds={10} />
      <Link href="/market" className="text-sm text-stone-500 hover:underline">
        ← Market
      </Link>
      <RefPriceStrip prices={prices} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ListingFacts listing={listing} />
        {listing.status === 'open' ? (
          <BidForm listing={listing} existing={existing} />
        ) : (
          <p className="rounded-2xl border bg-white p-5 text-stone-600">This listing is no longer open for bids.</p>
        )}
      </div>
      {mine.length > 0 ? (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="mb-2 font-semibold">Your bids on this listing</h2>
          {mine.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-3 text-sm">
              <span>
                A {b.price_a} · B {b.price_b ?? '–'} · C {b.price_c ?? '–'} Rs/kg · collect {formatDate(b.collection_date)} · loading by{' '}
                {b.loading_paid_by}
              </span>
              <Badge variant="outline" className="capitalize">
                {b.status}
              </Badge>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
