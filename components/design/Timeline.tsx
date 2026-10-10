// Pakka Sauda design system: vertical event list (oldest first).
import type { ReactNode } from 'react';
import { cx } from './cn';

export function Timeline({ items }: { items: Array<{ id: string | number; title: ReactNode; meta?: ReactNode; tone?: 'brand' | 'danger' | 'neutral' }> }) {
  return (
    <ol className="flex flex-col">
      {items.map((it, i) => (
        <li key={it.id} className="relative flex gap-3 pb-5 last:pb-0">
          {i < items.length - 1 ? <span className="absolute top-4 bottom-0 start-[5px] w-px bg-line" aria-hidden /> : null}
          <span
            className={cx(
              'relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4 ring-surface',
              it.tone === 'danger' ? 'bg-danger' : it.tone === 'neutral' ? 'bg-line-strong' : 'bg-brand',
            )}
            aria-hidden
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-ink">{it.title}</span>
            {it.meta ? <span className="text-xs text-ink-muted">{it.meta}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
