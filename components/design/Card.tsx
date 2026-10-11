// Pakka Sauda design system: bordered surface with an optional header row.
import type { ReactNode } from 'react';
import { cx } from './cn';

export function Card({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  tone = 'default',
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: 'default' | 'brand' | 'attn' | 'danger' | 'subtle';
}) {
  const toneCls = {
    default: 'border-line bg-surface',
    brand: 'border-brand/25 bg-brand-soft',
    attn: 'border-attn/25 bg-attn-soft',
    danger: 'border-danger/25 bg-danger-soft',
    subtle: 'border-line bg-subtle',
  }[tone];
  return (
    <section className={cx('rounded-2xl border shadow-card', toneCls, className)}>
      {title || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-5 sm:px-6">
          <div className="flex min-w-0 flex-col gap-0.5">
            {title ? <h2 className="text-base font-semibold text-ink">{title}</h2> : null}
            {description ? <p className="text-[13px] text-ink-muted">{description}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cx('px-5 py-5 sm:px-6', bodyClassName)}>{children}</div>
    </section>
  );
}
