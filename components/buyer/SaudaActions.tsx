'use client';
// Pakka Sauda: wholesaler status panel; switches on the sauda status. Owner: Workstream D.
// Phase 1: token_due (countdown + Pay token). Collection, dispute and settlement panels come in phase 2.
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { payToken } from '@/app/actions/saudas';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { Button } from '@/components/ui/button';
import { formatRs } from '@/lib/format';
import type { SaudaView } from '@/lib/types';
import { errorText } from './errors';
import { nextAction } from './nextAction';

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

  if (sauda.status === 'token_due') {
    return (
      <section className="flex flex-col gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Token due</h2>
          <Countdown until={sauda.token_due_by} />
        </div>
        <p className="text-sm">
          Pay the token of <span className="font-semibold">{formatRs(sauda.terms.token_amount)}</span> to lock the deal. <DemoBadge />
        </p>
        <Button onClick={pay} disabled={busy} className="h-11 bg-green-700 text-base text-white hover:bg-green-800">
          {busy ? 'Paying…' : 'Pay token (DEMO)'}
        </Button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-semibold">{nextAction(sauda)}</h2>
      {sauda.status === 'awaiting_collection' && sauda.collection_code ? (
        <p className="text-sm text-stone-600">The farmer&apos;s phone shows a one-time collection code. Collection form: phase 2.</p>
      ) : (
        <p className="text-sm text-stone-500">More actions arrive in phase 2.</p>
      )}
    </section>
  );
}
