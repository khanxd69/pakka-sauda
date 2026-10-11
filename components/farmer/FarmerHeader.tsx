// Pakka Sauda: farmer header: brand, name in Urdu, home button, small exit link. Owner: Workstream B.
import Link from 'next/link';
import { House, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/session';
import { BrandMark } from '@/components/design/BrandMark';

export function FarmerHeader({ nameUr }: { nameUr: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-md items-center gap-3 px-4 py-2">
        <BrandMark className="size-8" />
        <span className="flex-1 truncate text-xl font-semibold text-ink">{nameUr}</span>
        <Link href="/f" aria-label="گھر / Home" className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-colors hover:bg-subtle hover:text-ink">
          <House className="size-6" strokeWidth={1.5} aria-hidden />
        </Link>
        <form action={signOut}>
          <button type="submit" dir="ltr" className="flex min-h-14 items-center gap-1.5 rounded-xl px-2 text-[13px] text-ink-muted transition-colors hover:bg-subtle">
            <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
            Exit
          </button>
        </form>
      </div>
    </header>
  );
}
