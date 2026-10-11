// Pakka Sauda design system: KPI card with an optional SVG sparkline or bar (no chart library).
import type { ReactNode } from 'react';
import { cx } from './cn';

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const w = 96;
  const h = 28;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-24 text-brand" aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  spark,
  emphasis = false,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  spark?: number[];
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cx('flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6', emphasis && 'border-brand/20 bg-brand-soft/50', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-muted">{label}</span>
        {icon ? <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand [&_svg]:size-[18px]">{icon}</span> : null}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <span className={cx('break-words font-semibold tabular-nums tracking-tight text-ink', emphasis ? 'text-[32px] leading-tight' : 'text-2xl leading-tight')}>{value}</span>
        {spark ? <Sparkline values={spark} /> : null}
      </div>
      {sub ? <span className="text-xs text-ink-muted">{sub}</span> : null}
    </div>
  );
}
