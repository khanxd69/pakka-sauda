// Pakka Sauda: admin tiles from getAdminStats(): settled value and fee revenue big, then counts. Owner: Workstream D.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRs } from '@/lib/format';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import type { AdminStats, SaudaStatus } from '@/lib/types';

function Tile({ label, value, big = false }: { label: string; value: string | number; big?: boolean }) {
  return (
    <div className={`flex flex-col gap-1 rounded-2xl border bg-white p-5 ${big ? 'sm:col-span-2' : ''}`}>
      <span className="text-sm text-stone-500">{label}</span>
      <span className={`${big ? 'text-4xl' : 'text-2xl'} font-bold tabular-nums`}>{value}</span>
    </div>
  );
}

export function StatTiles({ stats }: { stats: AdminStats }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <Tile big label="Settled deal value" value={formatRs(stats.settled_value)} />
        <Tile big label="Fee revenue (1%, paid by buyers)" value={formatRs(stats.fee_revenue)} />
        <Tile label="Active listings" value={stats.active_listings} />
        <Tile label="Open disputes" value={stats.open_disputes} />
        <Tile label="Farmers" value={stats.farmers} />
        <Tile label="Wholesalers" value={stats.wholesalers} />
      </div>
      <div className="rounded-2xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sauda status</TableHead>
              <TableHead className="text-right">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Object.keys(stats.by_status) as SaudaStatus[]).map((s) => (
              <TableRow key={s}>
                <TableCell>{STATUS_LABEL[s].en}</TableCell>
                <TableCell className="text-right tabular-nums">{stats.by_status[s]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
