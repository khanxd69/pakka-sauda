// Pakka Sauda: wholesaler's saudas with lifecycle progress and the next action per status. Owner: Workstream D.
import Link from 'next/link';
import { Handshake } from 'lucide-react';
import { nextAction } from '@/components/buyer/nextAction';
import { Avatar } from '@/components/design/Avatar';
import { DataTable, num, th } from '@/components/design/DataTable';
import { EmptyState } from '@/components/design/EmptyState';
import { PageHeader } from '@/components/design/PageHeader';
import { StatusPill } from '@/components/design/StatusPill';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatKg } from '@/lib/format';
import { getSaudasForUser } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import type { SaudaStatus } from '@/lib/types';

const ORDER: SaudaStatus[] = ['token_due', 'awaiting_collection', 'collected', 'agreed', 'settled'];

function MiniProgress({ status }: { status: SaudaStatus }) {
  const at = status === 'disputed' ? 2 : ORDER.indexOf(status);
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {ORDER.map((s, i) => (
        <span
          key={s}
          className={`h-1.5 w-5 rounded-full ${
            status === 'cancelled' ? 'bg-line' : status === 'disputed' && i === 2 ? 'bg-danger' : i <= at ? 'bg-brand' : 'bg-line-strong/60'
          }`}
        />
      ))}
    </span>
  );
}

export default async function MySaudasPage() {
  const user = await requireUser('wholesaler');
  const saudas = await getSaudasForUser(user);
  return (
    <>
      <AutoRefresh />
      <PageHeader title="My saudas" description="Accepted deals, from token to settlement." />
      {saudas.length === 0 ? (
        <EmptyState icon={<Handshake strokeWidth={1.5} />} title="No saudas yet" description="When a farmer accepts one of your bids, the deal appears here." />
      ) : (
        <DataTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={th}>Farmer</TableHead>
                <TableHead className={th}>Quantity</TableHead>
                <TableHead className={`${th} text-right`}>A / B / C</TableHead>
                <TableHead className={th}>Progress</TableHead>
                <TableHead className={th}>Next action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saudas.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/saudas/${s.id}`} className="flex items-center gap-3">
                      <Avatar name={s.farmer.name} size="sm" />
                      <span className="flex flex-col">
                        <span className="font-medium text-ink hover:underline">{s.farmer.name}</span>
                        <span className="text-xs text-ink-muted">{s.listing.district}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums text-ink">
                    {formatKg(s.terms.qty_low_kg)} – {formatKg(s.terms.qty_high_kg)}
                  </TableCell>
                  <TableCell className={num}>
                    {s.terms.price.A ?? '–'} / {s.terms.price.B ?? '–'} / {s.terms.price.C ?? '–'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <StatusPill kind="sauda" status={s.status} />
                      <MiniProgress status={s.status} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/saudas/${s.id}`} className="text-[13px] font-medium text-brand hover:underline">
                      {nextAction(s)}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      )}
    </>
  );
}
