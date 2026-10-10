// Pakka Sauda design system: label / value rows. Numeric values right-aligned and tabular.
import type { ReactNode } from 'react';
import { cx } from './cn';

export function KeyValueList({ items, className }: { items: Array<{ label: ReactNode; value: ReactNode; strong?: boolean; numeric?: boolean }>; className?: string }) {
  return (
    <dl className={cx('flex flex-col divide-y divide-line', className)}>
      {items.map((it, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-[13px] text-ink-muted">{it.label}</dt>
          <dd className={cx('text-right text-sm text-ink', it.strong && 'font-semibold', it.numeric && 'tabular-nums')}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
