// Pakka Sauda: the settlement maths as a table: weighed kg x price = final amount, fee, token, balance, buyer pays.
// Every number comes from lib/settle.ts (or the stored sauda columns). Owner: Workstream D.
import { Card } from '@/components/design/Card';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { formatKg, formatRs } from '@/lib/format';
import type { SettleResult } from '@/lib/settle';

export function SettlementBreakdown({ r, title = 'Settlement' }: { r: SettleResult; title?: string }) {
  if (r.outcome !== 'payable') {
    return (
      <Card title={title} tone="danger">
        <p className="text-sm text-danger">
          {formatKg(r.weighedKg)} recorded as grade {r.grade}, which was not priced. Nothing is payable; the token goes back to the buyer if this stands.
        </p>
      </Card>
    );
  }
  const row = (label: string, value: string, opts: { op?: string; strong?: boolean; muted?: boolean } = {}) => (
    <tr className={opts.strong ? 'border-t border-line-strong' : ''}>
      <td className={`py-2 text-[13px] ${opts.muted ? 'text-ink-muted' : 'text-ink'}`}>{label}</td>
      <td className="w-6 py-2 text-center text-ink-muted">{opts.op ?? ''}</td>
      <td className={`py-2 text-right tabular-nums ${opts.strong ? 'text-base font-semibold text-ink' : 'text-sm text-ink'}`}>{value}</td>
    </tr>
  );
  return (
    <Card title={title} actions={<DemoBadge />}>
      <table className="w-full">
        <tbody>
          {row('Weighed', formatKg(r.weighedKg))}
          {row(`Price for grade ${r.grade}`, `${formatRs(r.pricePerKg)}/kg`, { op: '×' })}
          {row('Final amount to farmer', formatRs(r.finalAmount), { op: '=', strong: true })}
          {row('Token already paid', formatRs(r.tokenAmount), { op: '−', muted: true })}
          {row(r.balanceAtLoading >= 0 ? 'Balance at loading' : 'Farmer refunds', formatRs(Math.abs(r.balanceAtLoading)), { op: '=', strong: true })}
          {row('Platform fee (paid by buyer)', formatRs(r.fee), { op: '+', muted: true })}
          {row('Buyer pays in total', formatRs(r.buyerPays), { strong: true })}
        </tbody>
      </table>
    </Card>
  );
}
