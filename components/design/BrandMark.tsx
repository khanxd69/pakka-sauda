// Pakka Sauda design system: brand mark (a sealed-deal leaf) and wordmark. Inline SVG, no external assets.
import { cx } from './cn';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand" />
      <path d="M9 18.5c0-5.5 4.5-9.5 14-10-.4 9.6-4.4 14-10 14-2.4 0-4-1.6-4-4Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11.5 21 18 14.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className, sub }: { className?: string; sub?: string }) {
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight text-ink">Pakka Sauda</span>
        {sub ? <span className="text-[11px] text-ink-muted">{sub}</span> : null}
      </span>
    </span>
  );
}
