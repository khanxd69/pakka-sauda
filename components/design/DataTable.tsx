// Pakka Sauda design system: table container: bordered card, own horizontal scroll, sticky header styles.
// Use with the shadcn Table parts; numeric cells get `num`.
import type { ReactNode } from 'react';
import { cx } from './cn';

export const num = 'text-right tabular-nums';
export const th = 'h-12 bg-subtle/70 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted';

export function DataTable({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('min-w-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
      <div className="overflow-x-auto [&_thead_tr]:sticky [&_thead_tr]:top-0 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-brand-soft/35 [&_td]:px-5 [&_th]:px-5 [&_td]:py-4 [&_td]:text-sm">
        {children}
      </div>
    </div>
  );
}
