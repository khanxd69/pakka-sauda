// Pakka Sauda design system: a small rounded status/label pill. Tone carries meaning; nothing else is coloured.
import type { ReactNode } from 'react';
import { cx } from './cn';

export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'attn';

const TONE: Record<Tone, string> = {
  neutral: 'bg-subtle text-ink-muted ring-line',
  brand: 'bg-brand-soft text-brand ring-brand/20',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning-soft text-warning ring-warning/20',
  danger: 'bg-danger-soft text-danger ring-danger/20',
  info: 'bg-info-soft text-info ring-info/20',
  attn: 'bg-attn-soft text-attn ring-attn/20',
};

export function Pill({ tone = 'neutral', children, dot = false, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', TONE[tone], className)}>
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  );
}
