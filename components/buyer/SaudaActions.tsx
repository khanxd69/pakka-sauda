'use client';
// Pakka Sauda: wholesaler status panel; switches on the sauda status. Owner: Workstream D.
// Every amount comes from sauda columns or lib/settle.ts.
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cancelSauda, payToken } from '@/app/actions/saudas';
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
  if (ms <= 0) return <span className="font-semibold text-red-700">Token window passed</span>;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (
    <span className="font-mono text-2xl font-bold tabular-nums">
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

function Panel({ tone = 'stone', title, children }: { tone?: 'stone' | 'amber' | 'green' | 'red'; title: string; children?: React.ReactNode }) {
  const cls = { stone: 'border bg-white', amber: 'border-2 border-amber-300 bg-amber-50', green: 'border-2 border-green-300 bg-green-50', red: 'border-2 border-red-200 bg-red-50' }[tone];
  return (
    <section className={`flex flex-col gap-2 rounded-2xl p-5 ${cls}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Recorded({ sauda }: { sauda: SaudaView }) {
  if (sauda.weighed_kg == null) return null;
  return (
    <p className="text-sm">
      Recorded: <span className="font-semibold">{formatKg(sauda.weighed_kg)}</span>, grade{' '}
      <span className="font-semibold">{sauda.delivered_grade}</span>
      {sauda.final_amount != null ? (
        <>
          {' '}
          = <span className="font-semibold">{formatRs(sauda.final_amount)}</span>
        </>
      ) : (
        ' (grade not priced)'
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
      className="border-red-300 text-red-700"
    >
      Walk away
    </Button>
  );

  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  const r = sauda.weighed_kg != null && grade ? settle(sauda.terms, sauda.weighed_kg, grade) : null;

  switch (sauda.status) {
    case 'token_due':
      return (
        <Panel tone="amber" title="Token due">
          <Countdown until={sauda.token_due_by} />
          <p className="text-sm">
            Pay the token of <span className="font-semibold">{formatRs(sauda.terms.token_amount)}</span> to lock the deal. <DemoBadge />
          </p>
          <Button onClick={pay} disabled={busy} className="h-11 bg-green-700 text-base text-white hover:bg-green-800">
            {busy ? 'Paying…' : 'Pay token (DEMO)'}
          </Button>
          {walkAway}
        </Panel>
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
        <Panel title="Waiting for the farmer to confirm.">
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
        </Panel>
      );
    case 'disputed':
      return (
        <Panel tone="red" title="Under review by a neutral reviewer. Do not load.">
          <Recorded sauda={sauda} />
          <p className="text-sm">
            Farmer claims grade <span className="font-semibold">{sauda.farmer_claimed_grade}</span>
            {sauda.dispute_reason ? ` (${sauda.dispute_reason})` : ''}.
          </p>
        </Panel>
      );
    case 'agreed':
      return (
        <Panel tone="green" title={r?.outcome === 'payable' ? `Pay the balance ${formatRs(r.balanceAtLoading)} to the farmer at loading` : 'Agreed'}>
          <p className="text-sm">Payment happens outside the app. The farmer confirms receipt. <DemoBadge /></p>
          {sauda.resolved_grade ? (
            <p className="text-sm">
              Reviewer ruled grade <span className="font-semibold">{sauda.resolved_grade}</span>: {sauda.resolution_note}
            </p>
          ) : null}
          {r?.outcome === 'payable' ? (
            <p className="text-sm text-stone-600">
              Total {formatRs(r.finalAmount)} · token {formatRs(r.tokenAmount)} · fee {formatRs(r.fee)} · you pay {formatRs(r.buyerPays)}
            </p>
          ) : null}
        </Panel>
      );
    case 'settled':
      return (
        <Panel tone="green" title="Settled">
          {r?.outcome === 'payable' ? (
            <p className="text-sm">
              {formatKg(r.weighedKg)} grade {r.grade}: farmer received {formatRs(sauda.final_amount ?? r.finalAmount)}; platform fee charged{' '}
              {formatRs(sauda.platform_fee ?? r.fee)}; you paid {formatRs(r.buyerPays)}. <DemoBadge />
            </p>
          ) : null}
        </Panel>
      );
    case 'cancelled':
      return (
        <Panel title={`Cancelled: ${sauda.cancel_reason ? CANCEL_TEXT[sauda.cancel_reason] : 'no reason'}`}>
          <p className="text-sm">
            Token {sauda.token_to ? `goes to the ${sauda.token_to === 'buyer' ? 'buyer (you)' : 'farmer'}` : 'was never paid'}.
          </p>
        </Panel>
      );
  }
}
