// Pakka Sauda design system: dashboard shell: left sidebar (desktop), top bar, bottom tab bar (mobile).
import Link from 'next/link';
import { LogOut, Sprout } from 'lucide-react';
import type { ReactNode } from 'react';
import { signOut } from '@/app/actions/session';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { Avatar } from './Avatar';
import { Wordmark } from './BrandMark';
import { NavLink } from './NavLink';
import { Pill } from './Pill';

export interface ShellNavItem {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

export function AppShell({
  nav,
  home,
  area,
  user,
  sidebarFooter,
  children,
}: {
  nav: ShellNavItem[];
  home: string;
  area: string;
  user: { name: string; sub?: string; verified?: boolean | null };
  sidebarFooter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-page">
      <a href="#dashboard-content" className="skip-link">Skip to content</a>
      <aside className="dashboard-sidebar fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-line md:flex">
        <Link href={home} className="flex h-24 items-center px-5">
          <Wordmark sub={area} />
        </Link>
        <p className="px-6 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">Your workspace</p>
        <nav className="flex flex-col gap-2 px-3 py-2" aria-label="Main">
          {nav.map((n) => (
            <NavLink key={n.href} href={n.href} exact={n.exact}>
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-line p-4">
          <div className="mb-2 rounded-2xl border border-brand/10 bg-surface/70 p-4"><Sprout className="mb-3 size-6 text-brand" aria-hidden /><p className="text-sm font-semibold text-ink">Rooted in clear terms.</p><p className="mt-1.5 text-xs leading-relaxed text-ink-muted">A price for each grade. An agreement both sides can follow.</p></div>
          {sidebarFooter}
          <DemoBadge text="DEMO: simulated payments" />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col md:ps-60">
        <header className="sticky top-0 z-20 flex min-h-20 items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur-xl md:px-8">
          <span className="hidden items-center gap-2 text-xs font-medium text-ink-muted md:inline-flex"><span className="size-1.5 rounded-full bg-brand" />{area} workspace</span>
          <Link href={home} className="md:hidden">
            <Wordmark />
          </Link>
          <div className="ms-auto flex items-center gap-3">
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-sm font-medium text-ink">{user.name}</span>
              {user.sub ? <span className="text-xs text-ink-muted">{user.sub}</span> : null}
            </div>
            {user.verified != null ? (
              user.verified ? (
                <Pill tone="success" dot>
                  Verified
                </Pill>
              ) : (
                <Pill tone="neutral">Unverified</Pill>
              )
            ) : null}
            <Avatar name={user.name} />
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Switch user"
                className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-line px-3 text-[13px] text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
              >
                <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
                <span className="hidden sm:inline">Switch user</span>
              </button>
            </form>
          </div>
        </header>
        <main id="dashboard-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-28 md:px-8 md:py-10 md:pb-10">{children}</main>
      </div>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 backdrop-blur-xl md:hidden" aria-label="Main">
        {nav.map((n) => (
          <NavLink key={n.href} href={n.href} variant="tab" exact={n.exact}>
            {n.icon}
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
