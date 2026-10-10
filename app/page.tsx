// Pakka Sauda: choose demo user. Owner: Workstream D. No password: this is a demo.
import { Noto_Nastaliq_Urdu } from 'next/font/google';
import { ShieldCheck, Sprout, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { UserCard } from '@/components/buyer/UserCard';
import { Wordmark } from '@/components/design/BrandMark';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { getProfiles } from '@/lib/queries';
import type { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400'], variable: '--font-nastaliq', display: 'swap' });

const GROUPS: Array<{ role: Role; title: string; blurb: string; icon: ReactNode }> = [
  { role: 'farmer', title: 'Farmer', blurb: 'List a harvest by Urdu voice, hear offers, confirm the deal.', icon: <Sprout strokeWidth={1.5} /> },
  { role: 'wholesaler', title: 'Wholesaler', blurb: 'Browse listings, bid a price for each grade, record collection.', icon: <Store strokeWidth={1.5} /> },
  { role: 'admin', title: 'Reviewer', blurb: 'Rule on grade disputes from evidence and monitor settlements.', icon: <ShieldCheck strokeWidth={1.5} /> },
];

export default async function ChooseUserPage() {
  const profiles = await getProfiles();
  return (
    <main className={`${nastaliq.variable} mx-auto flex min-h-dvh max-w-6xl flex-col gap-10 px-4 py-10 md:px-6 md:py-16`}>
      <header className="flex flex-col gap-6">
        <Wordmark sub="Harvest deals with terms locked before the truck arrives" />
        <div className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-[32px] font-semibold leading-tight tracking-tight text-ink">Pakka Sauda: demo</h1>
          <p className="text-base text-ink-muted">
            Choose who you are. No password: this is a demo. Final amount = weighed kg × the agreed price for that grade.
          </p>
          <DemoBadge text="Demo environment: simulated payments" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {GROUPS.map((g) => (
          <section key={g.role} className="flex min-w-0 flex-col rounded-xl border border-line bg-surface shadow-card">
            <div className="flex items-start gap-3 border-b border-line p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand [&_svg]:size-5">{g.icon}</span>
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-semibold text-ink">{g.title}</h2>
                <p className="text-[13px] text-ink-muted">{g.blurb}</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              {profiles
                .filter((p) => p.role === g.role)
                .map((p) => (
                  <UserCard key={p.id} profile={p} />
                ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-auto border-t border-line pt-6 text-[13px] text-ink-muted">All prices ILLUSTRATIVE unless marked AMIS.</footer>
    </main>
  );
}
