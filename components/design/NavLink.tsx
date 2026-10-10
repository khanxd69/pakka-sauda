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
        className={cx('flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors [&_svg]:size-5', active ? 'text-brand' : 'text-ink-muted')}
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
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0',
        active ? 'bg-brand-soft font-medium text-brand' : 'text-ink-muted hover:bg-subtle hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
