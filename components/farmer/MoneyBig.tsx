// Pakka Sauda: a huge rupee amount, South Asian grouping, always left to right. Owner: Workstream B.
import { formatRsPK } from '@/lib/format';

export function MoneyBig({ amount, className }: { amount: number; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block text-5xl font-bold tabular-nums ${className ?? ''}`}>
      {formatRsPK(amount)}
    </span>
  );
}
