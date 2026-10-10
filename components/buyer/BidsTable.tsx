'use client';
// Pakka Sauda: the wholesaler's bids, with withdraw on pending rows and a sauda link on accepted rows. Owner: D.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { withdrawBid } from '@/app/actions/bids';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatKg } from '@/lib/format';
import type { BidStatus, BidView } from '@/lib/types';
import { errorText } from './errors';

const STATUS_CLASS: Record<BidStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  accepted: 'bg-green-600 text-white',
  rejected: 'bg-stone-200 text-stone-700',
  withdrawn: 'bg-stone-100 text-stone-500',
};

export function BidsTable({ bids, saudaByBid }: { bids: BidView[]; saudaByBid: Record<string, string> }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function withdraw(id: string) {
    setBusyId(id);
    const res = await withdrawBid(id);
    setBusyId(null);
    if (res.ok) toast.success('Bid withdrawn');
    else toast.error(errorText(res.error));
    router.refresh();
  }

  if (bids.length === 0) return <p className="rounded-xl border border-dashed bg-white p-8 text-center text-stone-500">No bids yet.</p>;

  return (
    <div className="rounded-2xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Listing</TableHead>
            <TableHead>Ladder A / B / C (Rs/kg)</TableHead>
            <TableHead>Collection</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Link href={`/market/${b.listing_id}`} className="hover:underline">
                  {formatKg(b.listing.qty_low_kg)} – {formatKg(b.listing.qty_high_kg)} · {b.listing.district}
                </Link>
              </TableCell>
              <TableCell>
                {b.price_a} / {b.price_b ?? '–'} / {b.price_c ?? '–'}
              </TableCell>
              <TableCell>{formatDate(b.collection_date)}</TableCell>
              <TableCell>
                <Badge className={`capitalize ${STATUS_CLASS[b.status]}`}>{b.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {b.status === 'pending' ? (
                  <Button variant="outline" size="sm" disabled={busyId === b.id} onClick={() => withdraw(b.id)}>
                    {busyId === b.id ? 'Withdrawing…' : 'Withdraw'}
                  </Button>
                ) : b.status === 'accepted' && saudaByBid[b.id] ? (
                  <Link href={`/saudas/${saudaByBid[b.id]}`} className="text-sm font-medium text-green-700 hover:underline">
                    Open sauda →
                  </Link>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
