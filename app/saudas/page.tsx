// Pakka Sauda: wholesaler's saudas with the next action per status. Owner: Workstream D.
import Link from 'next/link';
import { nextAction } from '@/components/buyer/nextAction';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatKg } from '@/lib/format';
import { getSaudasForUser } from '@/lib/queries';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import { requireUser } from '@/lib/session';

export default async function MySaudasPage() {
  const user = await requireUser('wholesaler');
  const saudas = await getSaudasForUser(user);
  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh />
      <h1 className="text-2xl font-bold">My saudas</h1>
      {saudas.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-8 text-center text-stone-500">No saudas yet.</p>
      ) : (
        <div className="rounded-2xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Ladder A / B / C</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saudas.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/saudas/${s.id}`} className="font-medium hover:underline">
                      {s.farmer.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatKg(s.terms.qty_low_kg)} – {formatKg(s.terms.qty_high_kg)}
                  </TableCell>
                  <TableCell>
                    {s.terms.price.A ?? '–'} / {s.terms.price.B ?? '–'} / {s.terms.price.C ?? '–'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{STATUS_LABEL[s.status].en}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/saudas/${s.id}`} className="text-green-700 hover:underline">
                      {nextAction(s)}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
