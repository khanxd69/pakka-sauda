// Pakka Sauda: verify wholesalers (P1). Owner: Workstream D.
import { VerifyToggle } from '@/components/admin/VerifyToggle';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getWholesalers } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function UsersPage() {
  await requireUser('admin');
  const wholesalers = await getWholesalers();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Wholesalers</h1>
      <div className="rounded-2xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>District</TableHead>
              <TableHead className="text-right">Verified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wholesalers.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.business_name ?? w.name}</TableCell>
                <TableCell>
                  {w.name} · {w.phone ?? '–'}
                </TableCell>
                <TableCell>{w.district ?? '–'}</TableCell>
                <TableCell className="text-right">
                  <VerifyToggle profileId={w.id} verified={w.verified} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
