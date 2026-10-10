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
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  spark?: number[];
  emphasis?: boolean;
}) {
  return (
    <div className={cx('flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-card', emphasis && 'ring-1 ring-brand/15')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-muted">{label}</span>
        {icon ? <span className="text-ink-muted [&_svg]:size-4">{icon}</span> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className={cx('font-semibold tabular-nums tracking-tight text-ink', emphasis ? 'text-[32px] leading-none' : 'text-2xl leading-none')}>{value}</span>
        {spark ? <Sparkline values={spark} /> : null}
      </div>
      {sub ? <span className="text-xs text-ink-muted">{sub}</span> : null}
    </div>
  );
}
