// Pakka Sauda: reviewer (admin) layout. Owner: Workstream D.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions/session';
import { getCurrentUser } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/');
  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/admin" className="font-bold">
            🥔 Pakka Sauda · Reviewer
          </Link>
          <Link href="/admin" className="text-sm text-stone-700 hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/users" className="text-sm text-stone-700 hover:underline">
            Wholesalers
          </Link>
          <form action={signOut} className="ml-auto">
            <button type="submit" className="text-sm text-stone-500 underline hover:text-stone-900">
              Switch user
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
