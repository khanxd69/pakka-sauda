// Pakka Sauda design system: the sauda lifecycle as steps (token due -> awaiting collection -> collected -> agreed -> settled).
// Labels: STATUS_LABEL (Urdu on farmer screens) or short English labels on dashboards.
import { Check, X } from 'lucide-react';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import type { SaudaStatus } from '@/lib/types';
import { cx } from './cn';

const STEPS = ['token_due', 'awaiting_collection', 'collected', 'agreed', 'settled'] as const;
const SHORT_EN: Record<(typeof STEPS)[number], string> = {
  token_due: 'Token',
  awaiting_collection: 'Collection',
  collected: 'Weighed',
  agreed: 'Agreed',
  settled: 'Settled',
};

export function Stepper({ status, lang = 'en', orientation = 'horizontal' }: { status: SaudaStatus; lang?: 'en' | 'ur'; orientation?: 'horizontal' | 'vertical' }) {
  const current = status === 'disputed' ? 2 : status === 'cancelled' ? -1 : STEPS.indexOf(status as (typeof STEPS)[number]);
  const label = (s: (typeof STEPS)[number]) => (lang === 'ur' ? STATUS_LABEL[s].ur : SHORT_EN[s]);
  const vertical = orientation === 'vertical';

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <span className="flex size-6 items-center justify-center rounded-full bg-subtle ring-1 ring-line-strong">
          <X className="size-3.5" strokeWidth={2} aria-hidden />
        </span>
        {STATUS_LABEL.cancelled[lang]}
      </div>
    );
  }

  return (
    <ol className={cx('flex', vertical ? 'flex-col gap-0' : 'items-start gap-0')} aria-label="Sauda progress">
      {STEPS.map((s, i) => {
        const done = i < current || (status === 'settled' && i === current);
        const active = i === current && status !== 'settled';
        const disputed = status === 'disputed' && i === 2;
        const dotCls = disputed
          ? 'bg-danger text-white'
          : done
            ? 'bg-brand text-white'
            : active
              ? 'bg-surface text-brand ring-2 ring-brand'
              : 'bg-surface text-ink-muted ring-1 ring-line-strong';
        const last = i === STEPS.length - 1;
        return (
          <li key={s} className={cx('relative flex', vertical ? 'gap-3 pb-5 last:pb-0' : 'flex-1 flex-col items-center gap-2 text-center')} aria-current={active ? 'step' : undefined}>
            {!last ? (
              <span
                className={cx('absolute', vertical ? 'top-7 bottom-0 start-3 w-px' : 'top-3 start-1/2 h-px w-full', i < current ? 'bg-brand' : 'bg-line-strong')}
                aria-hidden
              />
            ) : null}
            <span className={cx('relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums', dotCls)}>
              {done ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : disputed ? '!' : i + 1}
            </span>
            <span className={cx(vertical ? 'pt-0.5 text-base' : 'text-xs', active || disputed ? 'font-semibold text-ink' : 'text-ink-muted')}>
              {disputed ? STATUS_LABEL.disputed[lang] : label(s)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
