// Pakka Sauda design system: a rupee amount, tabular, with an optional DEMO label.
import { DemoBadge } from '@/components/shared/DemoBadge';
import { formatRs, formatRsPK } from '@/lib/format';
import { cx } from './cn';

export function MoneyCell({ amount, demo = false, pk = false, className }: { amount: number; demo?: boolean; pk?: boolean; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2 tabular-nums', className)}>
      <span dir="ltr">{pk ? formatRsPK(amount) : formatRs(amount)}</span>
      {demo ? <DemoBadge /> : null}
    </span>
  );
}
