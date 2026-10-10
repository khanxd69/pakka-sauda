'use client';
// Pakka Sauda: F11: has the farmer received the balance? ✓ settles the sauda. Owner: Workstream B.
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { confirmBalanceReceived } from '@/app/actions/saudas';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { settle } from '@/lib/settle';
import type { SaudaView } from '@/lib/types';
import { askBalance } from '@/lib/voice/phrases';
import { ActionBar, BigButton } from './BigButton';
import { GradeCard } from './GradeCard';
import { MoneyBig } from './MoneyBig';
import { PromptHeading } from './PromptHeading';
import { useFarmerAction } from './useFarmerAction';

export function BalancePanel({ sauda }: { sauda: SaudaView }) {
  const { busy, act } = useFarmerAction();
  const [closed, setClosed] = useState(false);
  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  if (sauda.weighed_kg == null || grade == null) return null;
  const r = settle(sauda.terms, sauda.weighed_kg, grade);
  if (r.outcome !== 'payable') return null;

  const ask = askBalance(r.balanceAtLoading);
  return (
    <div className="flex flex-col gap-4">
      {sauda.resolved_grade ? <PromptHeading clip="dispute_resolved" autoPlay size="md" /> : null}
      <div className="flex items-start gap-3 rounded-2xl border border-attn/30 bg-attn-soft p-4">
        <p className="flex-1 text-xl font-semibold leading-[2] text-ink">{ask}</p>
        <SpeakButton autoPlay text={ask} />
        <AudioPrompt clip="balance_ask" />
      </div>
      <GradeCard grade={grade} />
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <span className="text-lg text-ink-muted">باقی</span>
        <MoneyBig amount={r.balanceAtLoading} />
        <DemoBadge text="DEMO: payment happens in cash or by bank, outside the app" />
      </div>
      {closed ? null : (
        <ActionBar>
          <BigButton variant="go" icon={<Check strokeWidth={2.5} aria-hidden />} busy={busy} onClick={() => act(() => confirmBalanceReceived(sauda.id))}>
            مل گئے
          </BigButton>
          <BigButton variant="plain" icon={<X strokeWidth={2} aria-hidden />} disabled={busy} onClick={() => setClosed(true)}>
            ابھی نہیں
          </BigButton>
        </ActionBar>
      )}
    </div>
  );
}
