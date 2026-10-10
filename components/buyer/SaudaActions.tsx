'use client';
// Pakka Sauda: wholesaler status panel; switches on the sauda status. Owner: Workstream D.
// Every amount comes from sauda columns or lib/settle.ts.
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cancelSauda, payToken } from '@/app/actions/saudas';
import { Card } from '@/components/design/Card';
import { MoneyCell } from '@/components/design/MoneyCell';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { Button } from '@/components/ui/button';
import { formatKg, formatRs } from '@/lib/format';
import { isShortfall, settle } from '@/lib/settle';
import type { CancelReason, SaudaView } from '@/lib/types';
import { CollectionForm } from './CollectionForm';
import { errorText } from './errors';
import { CANCEL_TEXT } from './nextAction';

function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return <span className="text-sm font-medium text-danger">Token window passed</span>;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (
    <span className="inline-flex items-center gap-2 font-mono text-2xl font-semibold tabular-nums text-ink">
      <Clock className="size-5 text-warning" strokeWidth={1.5} aria-hidden />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

function Recorded({ sauda }: { sauda: SaudaView }) {
  if (sauda.weighed_kg == null) return null;
  return (
    <p className="text-sm text-ink">
      Recorded <span className="font-semibold tabular-nums">{formatKg(sauda.weighed_kg)}</span>, grade{' '}
      <span className="font-semibold">{sauda.delivered_grade}</span>
      {sauda.final_amount != null ? (
        <>
          {' '}
          = <span className="font-semibold tabular-nums">{formatRs(sauda.final_amount)}</span>
        </>
      ) : (
        <span className="text-ink-muted"> (grade not priced)</span>
      )}
    </p>
  );
}

export function SaudaActions({ sauda }: { sauda: SaudaView }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    const res = await payToken(sauda.id);
    setBusy(false);
    if (res.ok) toast.success('Token paid (DEMO)');
    else toast.error(errorText(res.error));
    router.refresh();
  }

  async function cancel(reason: CancelReason, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    const res = await cancelSauda({ saudaId: sauda.id, reason });
    setBusy(false);
    if (res.ok) toast.success('Sauda cancelled');
    else toast.error(errorText(res.error));
    router.refresh();
  }
  const walkAway = (
    <Button
      variant="outline"
      disabled={busy}
      onClick={() => cancel('buyer_walked_away', 'Walk away from this deal? Your token goes to the farmer.')}
      className="h-10 border-danger/30 text-danger hover:bg-danger-soft"
    >
      Walk away
    </Button>
  );

  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  const r = sauda.weighed_kg != null && grade ? settle(sauda.terms, sauda.weighed_kg, grade) : null;

  switch (sauda.status) {
    case 'token_due':
      return (
        <Card title="Token due" description="Pay within the window to lock the deal" tone="attn" actions={<Countdown until={sauda.token_due_by} />}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[13px] text-ink-muted">Token amount</span>
              <MoneyCell amount={sauda.terms.token_amount} demo className="text-2xl font-semibold text-ink" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={pay} disabled={busy} className="h-10 flex-1 text-sm">
                {busy ? 'Paying…' : 'Pay token (DEMO)'}
              </Button>
              {walkAway}
            </div>
          </div>
        </Card>
      );
    case 'awaiting_collection':
      return (
        <div className="flex flex-col gap-3">
          <CollectionForm sauda={sauda} />
          {walkAway}
        </div>
      );
    case 'collected':
      return (
        <Card title="Waiting for the farmer to confirm." description="The farmer hears the weight, grade and amount on his phone">
          <div className="flex flex-col gap-3">
            <Recorded sauda={sauda} />
            {sauda.weighed_kg != null && isShortfall(sauda.terms, sauda.weighed_kg) ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => cancel('shortfall', 'Cancel for shortfall? The weight is below 80% of the low estimate; your token is returned.')}
              >
                Cancel: shortfall
              </Button>
            ) : null}
          </div>
        </Card>
      );
    case 'disputed':
      return (
        <Card title="Under review by a neutral reviewer. Do not load." tone="danger">
          <div className="flex flex-col gap-2">
            <Recorded sauda={sauda} />
            <p className="text-sm text-ink">
              Farmer claims grade <span className="font-semibold">{sauda.farmer_claimed_grade}</span>
              {sauda.dispute_reason ? <span className="font-urdu text-ink-muted"> ({sauda.dispute_reason})</span> : null}.
            </p>
          </div>
        </Card>
      );
    case 'agreed':
      return (
        <Card
          title={r?.outcome === 'payable' ? `Pay the balance ${formatRs(r.balanceAtLoading)} to the farmer at loading` : 'Agreed'}
          description="Payment happens outside the app. The farmer confirms receipt."
          tone="brand"
          actions={<DemoBadge />}
        >
          {sauda.resolved_grade ? (
            <p className="text-sm text-ink">
              Reviewer ruled grade <span className="font-semibold">{sauda.resolved_grade}</span>: {sauda.resolution_note}
            </p>
          ) : (
            <p className="text-sm text-ink-muted">The farmer confirmed the recorded grade.</p>
          )}
        </Card>
      );
    case 'settled':
      return (
        <Card title="Settled" tone="brand" actions={<DemoBadge />}>
          {r?.outcome === 'payable' ? (
            <p className="text-sm text-ink">
              Farmer received <span className="font-semibold tabular-nums">{formatRs(sauda.final_amount ?? r.finalAmount)}</span>; platform fee charged{' '}
              <span className="font-semibold tabular-nums">{formatRs(sauda.platform_fee ?? r.fee)}</span>; you paid{' '}
              <span className="font-semibold tabular-nums">{formatRs(r.buyerPays)}</span>.
            </p>
          ) : null}
        </Card>
      );
    case 'cancelled':
      return (
        <Card title={`Cancelled: ${sauda.cancel_reason ? CANCEL_TEXT[sauda.cancel_reason] : 'no reason'}`} tone="subtle">
          <p className="text-sm text-ink-muted">
            Token {sauda.token_to ? `goes to the ${sauda.token_to === 'buyer' ? 'buyer (you)' : 'farmer'}` : 'was never paid'}.
          </p>
        </Card>
      );
  }
}
