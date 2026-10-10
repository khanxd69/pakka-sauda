// Pakka Sauda: wholesaler's bids. Owner: Workstream D.
import { BidsTable } from '@/components/buyer/BidsTable';
import { PageHeader } from '@/components/design/PageHeader';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getMyBids, getSaudasForUser } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function MyBidsPage() {
  const user = await requireUser('wholesaler');
  const [bids, saudas] = await Promise.all([getMyBids(user.id), getSaudasForUser(user)]);
  const saudaByBid = Object.fromEntries(saudas.map((s) => [s.bid_id, s.id]));
  return (
    <>
      <AutoRefresh />
      <PageHeader title="My bids" description="Every ladder you have placed. Pending bids can be withdrawn until the farmer accepts." />
      <BidsTable bids={bids} saudaByBid={saudaByBid} />
    </>
  );
}
