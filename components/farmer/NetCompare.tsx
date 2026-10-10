// Pakka Sauda: "what reaches your hand": mandi route vs this offer, two numbers with simple bars (lib/net.ts). Owner: B.
import { formatRsPK } from '@/lib/format';
import type { NetComparison } from '@/lib/net';

export function NetCompare({ net }: { net: NetComparison }) {
  const max = Math.max(net.mandiTotal, net.offerTotal, 1);
  const row = (label: string, total: number, bar: string) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-base text-ink-muted">{label}</span>
        <span dir="ltr" className="text-xl font-semibold tabular-nums text-ink">
          {formatRsPK(total)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-subtle">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(4, (total / max) * 100)}%` }} />
      </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-subtle/50 p-3">
      <span className="w-fit rounded-full bg-attn-soft px-2.5 text-sm text-attn">تخمینہ</span>
      {row('اس بولی سے', net.offerTotal, 'bg-brand')}
      {row('منڈی لے جائیں تو', net.mandiTotal, 'bg-line-strong')}
      <span dir="ltr" className="text-right text-[11px] text-ink-muted">
        ILLUSTRATIVE costs: commission, transport, labour
      </span>
    </div>
  );
}
