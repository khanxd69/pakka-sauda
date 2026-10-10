// Pakka Sauda: choose demo user (D1.1). Public server page; no password, this is a demo.
import { UserCard } from '@/components/buyer/UserCard';
import { getProfiles } from '@/lib/queries';
import type { Profile, Role } from '@/lib/types';

// ASSUMPTION: render per request so profile changes (e.g. setVerified) show without a rebuild.
export const dynamic = 'force-dynamic';

const GROUPS: Array<{ role: Role; title: string }> = [
  { role: 'farmer', title: 'Farmers' },
  { role: 'wholesaler', title: 'Wholesalers' },
  { role: 'admin', title: 'Reviewer' },
];

export default async function ChooseUserPage() {
  const profiles = await getProfiles();
  const byRole = (role: Role): Profile[] => profiles.filter((p) => p.role === role);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Pakka Sauda: demo</h1>
        <p className="text-muted-foreground">Choose who you are. No password: this is a demo.</p>
      </header>

      {GROUPS.map(({ role, title }) => (
        <section key={role} aria-labelledby={`group-${role}`} className="flex flex-col gap-3">
          <h2 id={`group-${role}`} className="text-lg font-semibold">
            {title}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byRole(role).map((p) => (
              <UserCard key={p.id} profile={p} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mt-auto border-t pt-4 text-sm text-muted-foreground">
        All prices ILLUSTRATIVE unless marked AMIS.
      </footer>
    </main>
  );
}
