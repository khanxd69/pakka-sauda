// Pakka Sauda: wholesaler's bids. Owner: Workstream D.
import { BidsTable } from '@/components/buyer/BidsTable';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getMyBids, getSaudasForUser } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function MyBidsPage() {
  const user = await requireUser('wholesaler');
  const [bids, saudas] = await Promise.all([getMyBids(user.id), getSaudasForUser(user)]);
  const saudaByBid = Object.fromEntries(saudas.map((s) => [s.bid_id, s.id]));
  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh />
      <h1 className="text-2xl font-bold">My bids</h1>
      <BidsTable bids={bids} saudaByBid={saudaByBid} />
    </div>
  );
}
