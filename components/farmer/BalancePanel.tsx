'use client';
// Pakka Sauda: F11: has the farmer received the balance? ✓ settles the sauda. Owner: Workstream B.
import { useState } from 'react';
import { confirmBalanceReceived } from '@/app/actions/saudas';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { settle } from '@/lib/settle';
import type { SaudaView } from '@/lib/types';
import { askBalance } from '@/lib/voice/phrases';
import { BigButton } from './BigButton';
import { GradeCard } from './GradeCard';
import { MoneyBig } from './MoneyBig';
import { useFarmerAction } from './useFarmerAction';

export function BalancePanel({ sauda }: { sauda: SaudaView }) {
  const { busy, act } = useFarmerAction();
  const [closed, setClosed] = useState(false);
  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  if (sauda.weighed_kg == null || grade == null) return null;
  const r = settle(sauda.terms, sauda.weighed_kg, grade);
  if (r.outcome !== 'payable') return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-3">
        {sauda.resolved_grade ? <AudioPrompt clip="dispute_resolved" autoPlay /> : null}
        <SpeakButton autoPlay text={askBalance(r.balanceAtLoading)} />
        <AudioPrompt clip="balance_ask" />
      </div>
      <GradeCard grade={grade} />
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-amber-50 p-5">
        <span className="text-xl">باقی</span>
        <MoneyBig amount={r.balanceAtLoading} />
        <DemoBadge text="DEMO: payment happens in cash or by bank, outside the app" />
      </div>
      {closed ? null : (
        <>
          <BigButton variant="go" icon="✓" busy={busy} onClick={() => act(() => confirmBalanceReceived(sauda.id))}>
            مل گئے
          </BigButton>
          <BigButton variant="plain" icon="✗" disabled={busy} onClick={() => setClosed(true)}>
            ابھی نہیں
          </BigButton>
        </>
      )}
    </div>
  );
}
