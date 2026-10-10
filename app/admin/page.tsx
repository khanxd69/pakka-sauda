// Pakka Sauda: reviewer dashboard: KPIs, needs-attention list, recent saudas. Owner: Workstream D.
import Link from 'next/link';
import { DisputeQueue } from '@/components/admin/DisputeQueue';
import { StatTiles } from '@/components/admin/StatTiles';
import { DataTable, num, th } from '@/components/design/DataTable';
import { PageHeader } from '@/components/design/PageHeader';
import { StatusPill } from '@/components/design/StatusPill';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatRs } from '@/lib/format';
import { getAdminStats, getDisputes, getSaudasForUser, getWholesalers } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function AdminPage() {
  const user = await requireUser('admin');
  const [stats, disputes, saudas, wholesalers] = await Promise.all([getAdminStats(), getDisputes(), getSaudasForUser(user), getWholesalers()]);
  // Cumulative settled value in settlement order: real data only (sauda columns).
  const settledSeries = saudas
    .filter((s) => s.status === 'settled' && s.settled_at)
    .sort((a, b) => (a.settled_at! < b.settled_at! ? -1 : 1))
    .reduce<number[]>((acc, s) => acc.concat((acc.at(-1) ?? 0) + (s.final_amount ?? 0)), [0]);
  const recent = saudas.slice(0, 6);

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Overview" description="Settlements, fee revenue and the deals that need a person." />
      <div className="flex flex-col gap-6">
        <StatTiles stats={stats} verifiedBuyers={wholesalers.filter((w) => w.verified).length} settledSeries={settledSeries} />
        <section id="disputes" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Needs attention</h2>
          <DisputeQueue disputes={disputes} />
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink">Recent saudas</h2>
          <DataTable>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={th}>Farmer ↔ buyer</TableHead>
                  <TableHead className={th}>Created</TableHead>
                  <TableHead className={th}>Status</TableHead>
                  <TableHead className={`${th} text-right`}>Final amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/admin/disputes/${s.id}`} className="font-medium text-ink hover:underline">
                        {s.farmer.name} ↔ {s.buyer.business_name ?? s.buyer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-ink-muted">{formatDate(s.created_at.slice(0, 10))}</TableCell>
                    <TableCell>
                      <StatusPill kind="sauda" status={s.status} />
                    </TableCell>
                    <TableCell className={num}>{s.final_amount != null ? formatRs(s.final_amount) : <span className="text-ink-muted">—</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
        </section>
      </div>
    </>
  );
}
