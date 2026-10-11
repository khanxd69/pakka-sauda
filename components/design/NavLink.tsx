'use client';
// Pakka Sauda design system: sidebar / tab-bar link with an active state from the current path.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cx } from './cn';

export function NavLink({ href, children, variant = 'sidebar', exact = false }: { href: string; children: ReactNode; variant?: 'sidebar' | 'tab'; exact?: boolean }) {
  const path = usePathname();
  const active = exact ? path === href : path === href || path.startsWith(href + '/');
  if (variant === 'tab') {
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cx('flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors [&_svg]:size-5', active ? 'bg-brand-soft/60 text-brand' : 'text-ink-muted hover:bg-subtle')}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors duration-150 [&_svg]:size-[18px] [&_svg]:shrink-0',
        active ? 'bg-brand font-medium text-white shadow-card' : 'text-ink-muted hover:bg-subtle hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
