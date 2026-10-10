// Pakka Sauda: wholesaler navigation (D1.2). Server component, used by the market, bids and saudas layouts.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions/session';
import { requireUser } from '@/lib/session';

const LINKS = [
  { href: '/market', label: 'Market' },
  { href: '/bids', label: 'My bids' },
  { href: '/saudas', label: 'My saudas' },
] as const;

export async function BuyerNav() {
  // NOT_SIGNED_IN / WRONG_ROLE -> back to the choose-user screen (04-contracts §9).
  const user = await requireUser('wholesaler').catch(() => redirect('/'));

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <nav aria-label="Buyer" className="flex flex-wrap items-center gap-1">
          <span className="mr-3 font-bold">Pakka Sauda</span>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">{user.business_name ?? user.name}</span>
          {user.verified ? (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">✓ Verified</span>
          ) : (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">Unverified</span>
          )}
          <form action={signOut}>
            <button type="submit" className="rounded-md px-2 py-1 text-primary underline-offset-4 hover:underline">
              Switch user
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
