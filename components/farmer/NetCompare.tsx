// Pakka Sauda: "what reaches your hand": mandi route vs this offer, as two bars (from lib/net.ts compareNet). Owner: B.
import { formatRsPK } from '@/lib/format';
import type { NetComparison } from '@/lib/net';

export function NetCompare({ net }: { net: NetComparison }) {
  const max = Math.max(net.mandiTotal, net.offerTotal, 1);
  const bar = (label: string, total: number, color: string) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-lg">
        <span>{label}</span>
        <span dir="ltr" className="font-bold tabular-nums">{formatRsPK(total)}</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(4, (total / max) * 100)}%` }} />
      </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-stone-100 p-3">
      <span className="self-start rounded bg-yellow-200 px-2 text-sm text-yellow-900">تخمینہ</span>
      {bar('منڈی لے جائیں تو', net.mandiTotal, 'bg-stone-500')}
      {bar('اس بولی سے', net.offerTotal, 'bg-[#15803d]')}
    </div>
  );
}
