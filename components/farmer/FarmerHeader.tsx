// Pakka Sauda: farmer header: name in Urdu, home icon, small exit link. Owner: Workstream B.
import Link from 'next/link';
import { signOut } from '@/app/actions/session';

export function FarmerHeader({ nameUr }: { nameUr: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <Link href="/f" aria-label="گھر / Home" className="flex h-14 w-14 items-center justify-center rounded-full text-3xl">
          🏠
        </Link>
        <span className="text-2xl font-bold">{nameUr}</span>
        <form action={signOut}>
          <button type="submit" className="h-14 px-2 text-sm text-stone-500 underline" dir="ltr">
            Exit
          </button>
        </form>
      </div>
    </header>
  );
}
