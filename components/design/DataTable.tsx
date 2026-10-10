// Pakka Sauda design system: table container: bordered card, own horizontal scroll, sticky header styles.
// Use with the shadcn Table parts; numeric cells get `num`.
import type { ReactNode } from 'react';
import { cx } from './cn';

export const num = 'text-right tabular-nums';
export const th = 'h-10 bg-subtle text-xs font-medium uppercase tracking-wide text-ink-muted';

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('overflow-hidden rounded-xl border border-line bg-surface shadow-card', className)}>
      <div className="overflow-x-auto [&_thead_tr]:sticky [&_thead_tr]:top-0 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-subtle/60 [&_td]:py-3 [&_td]:text-sm">
        {children}
      </div>
    </div>
  );
}
