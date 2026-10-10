// Pakka Sauda design system: initials avatar (no photos).
import { cx } from './cn';

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const cls = { sm: 'size-7 text-[11px]', md: 'size-9 text-xs', lg: 'size-11 text-sm' }[size];
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand ring-1 ring-inset ring-brand/15', cls)} aria-hidden>
      {initials}
    </span>
  );
}
