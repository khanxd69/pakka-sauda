// Pakka Sauda: platform users; verify wholesalers (P1). Owner: Workstream D.
import { VerifyToggle } from '@/components/admin/VerifyToggle';
import { Avatar } from '@/components/design/Avatar';
import { DataTable, th } from '@/components/design/DataTable';
import { PageHeader } from '@/components/design/PageHeader';
import { Pill, type Tone } from '@/components/design/Pill';
import { StatCard } from '@/components/design/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getProfiles } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import type { Role } from '@/lib/types';

const ROLE: Record<Role, { label: string; tone: Tone }> = {
  farmer: { label: 'Farmer', tone: 'brand' },
  wholesaler: { label: 'Wholesaler', tone: 'info' },
  admin: { label: 'Reviewer', tone: 'neutral' },
};

export default async function UsersPage() {
  await requireUser('admin');
  const profiles = await getProfiles();
  const wholesalers = profiles.filter((p) => p.role === 'wholesaler');
  return (
    <>
      <PageHeader title="Users" description="Demo identities. Verification is shown to farmers on every offer." />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Farmers" value={profiles.filter((p) => p.role === 'farmer').length} />
          <StatCard label="Wholesalers" value={wholesalers.length} />
          <StatCard label="Verified wholesalers" value={wholesalers.filter((w) => w.verified).length} />
        </div>
        <DataTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={th}>Name</TableHead>
                <TableHead className={th}>Role</TableHead>
                <TableHead className={th}>Contact</TableHead>
                <TableHead className={th}>District</TableHead>
                <TableHead className={`${th} text-right`}>Verified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.business_name ?? p.name} size="sm" />
                      <div className="flex flex-col">
                        <span className="font-medium text-ink">{p.business_name ?? p.name}</span>
                        {p.business_name ? <span className="text-xs text-ink-muted">{p.name}</span> : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Pill tone={ROLE[p.role].tone}>{ROLE[p.role].label}</Pill>
                  </TableCell>
                  <TableCell className="tabular-nums text-ink-muted">{p.phone ?? '—'}</TableCell>
                  <TableCell className="text-ink-muted">{p.district ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {p.role === 'wholesaler' ? (
                      <span className="inline-flex items-center gap-3">
                        <span className="text-xs text-ink-muted">{p.verified ? 'Verified' : 'Unverified'}</span>
                        <VerifyToggle profileId={p.id} verified={p.verified} />
                      </span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </div>
    </>
  );
}
