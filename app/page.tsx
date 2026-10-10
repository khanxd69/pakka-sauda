// Pakka Sauda: choose demo user. Owner: Workstream D. No password: this is a demo.
import { UserCard } from '@/components/buyer/UserCard';
import { getProfiles } from '@/lib/queries';
import type { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

const GROUPS: Array<{ role: Role; title: string }> = [
  { role: 'farmer', title: 'Farmers' },
  { role: 'wholesaler', title: 'Wholesalers' },
  { role: 'admin', title: 'Reviewer' },
];

export default async function ChooseUserPage() {
  const profiles = await getProfiles();
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 bg-stone-50 px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold">Pakka Sauda: demo</h1>
        <p className="text-stone-600">Choose who you are. No password: this is a demo.</p>
      </header>
      {GROUPS.map((g) => (
        <section key={g.role} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-stone-700">{g.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {profiles
              .filter((p) => p.role === g.role)
              .map((p) => (
                <UserCard key={p.id} profile={p} />
              ))}
          </div>
        </section>
      ))}
      <footer className="mt-auto text-sm text-stone-500">All prices ILLUSTRATIVE unless marked AMIS.</footer>
    </main>
  );
}
