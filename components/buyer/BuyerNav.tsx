// Pakka Sauda: wholesaler navigation: Market · My bids · My saudas, business name, switch user. Owner: Workstream D.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions/session';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/session';

const LINKS = [
  { href: '/market', label: 'Market' },
  { href: '/bids', label: 'My bids' },
  { href: '/saudas', label: 'My saudas' },
];

export async function BuyerNav() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'wholesaler') redirect('/');
  return (
    <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/market" className="font-bold">
          🥔 Pakka Sauda
        </Link>
        <nav className="flex gap-4 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-stone-700 hover:text-stone-950 hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="font-medium">{user.business_name ?? user.name}</span>
          {user.verified ? <Badge className="bg-green-600 text-white">✓ Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
          <form action={signOut}>
            <button type="submit" className="text-stone-500 underline hover:text-stone-900">
              Switch user
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
