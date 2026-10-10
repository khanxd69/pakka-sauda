'use client';
// Pakka Sauda: the wholesaler's bids, with withdraw on pending rows and a sauda link on accepted rows. Owner: D.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { withdrawBid } from '@/app/actions/bids';
import { ArrowRight, Gavel } from 'lucide-react';
import { DataTable, num, th } from '@/components/design/DataTable';
import { EmptyState } from '@/components/design/EmptyState';
import { StatusPill } from '@/components/design/StatusPill';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatKg } from '@/lib/format';
import type { BidView } from '@/lib/types';
import { errorText } from './errors';


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

  if (bids.length === 0)
    return <EmptyState icon={<Gavel strokeWidth={1.5} />} title="No bids yet" description="Open a listing in the market and bid a price for each grade." />;

  return (
    <DataTable>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={th}>Listing</TableHead>
            <TableHead className={`${th} text-right`}>A / B / C (Rs/kg)</TableHead>
            <TableHead className={th}>Collection</TableHead>
            <TableHead className={th}>Status</TableHead>
            <TableHead className={th}>
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                <Link href={`/market/${b.listing_id}`} className="flex flex-col hover:underline">
                  <span className="font-medium tabular-nums text-ink">
                    {formatKg(b.listing.qty_low_kg)} – {formatKg(b.listing.qty_high_kg)}
                  </span>
                  <span className="text-xs text-ink-muted">Potato · {b.listing.district}</span>
                </Link>
              </TableCell>
              <TableCell className={num}>
                {b.price_a} / {b.price_b ?? '–'} / {b.price_c ?? '–'}
              </TableCell>
              <TableCell className="text-ink">
                {formatDate(b.collection_date)}
                <span className="block text-xs capitalize text-ink-muted">Loading: {b.loading_paid_by}</span>
              </TableCell>
              <TableCell>
                <StatusPill kind="bid" status={b.status} />
              </TableCell>
              <TableCell className="text-right">
                {b.status === 'pending' ? (
                  <Button variant="outline" size="sm" disabled={busyId === b.id} onClick={() => withdraw(b.id)}>
                    {busyId === b.id ? 'Withdrawing…' : 'Withdraw'}
                  </Button>
                ) : b.status === 'accepted' && saudaByBid[b.id] ? (
                  <Link href={`/saudas/${saudaByBid[b.id]}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline">
                    Open sauda
                    <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
                  </Link>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  );
}
