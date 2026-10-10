'use client';
// Pakka Sauda: F10: the buyer recorded weight and grade; the farmer hears the amount and confirms or disputes. Owner: B.
import { Ban, Check, X } from 'lucide-react';
import { useState } from 'react';
import { farmerConfirm } from '@/app/actions/saudas';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { formatRsPK, kgToMann } from '@/lib/format';
import { settle } from '@/lib/settle';
import type { SaudaView } from '@/lib/types';
import { explainCollection } from '@/lib/voice/phrases';
import { ActionBar, BigButton } from './BigButton';
import { DisputeSheet } from './DisputeSheet';
import { GradeCard } from './GradeCard';
import { MoneyBig } from './MoneyBig';
import { PromptHeading } from './PromptHeading';
import { useFarmerAction } from './useFarmerAction';

export function CollectionReview({ sauda }: { sauda: SaudaView }) {
  const { busy, act } = useFarmerAction();
  const [disputing, setDisputing] = useState(false);
  if (sauda.weighed_kg == null || sauda.delivered_grade == null) return null;
  const kg = sauda.weighed_kg;
  const grade = sauda.delivered_grade;
  const r = settle(sauda.terms, kg, grade);
  const buyerNameUr = sauda.buyer.name_ur ?? sauda.buyer.name;
  const text = explainCollection(
    r.outcome === 'payable'
      ? { kind: 'payable', buyerNameUr, weighedKg: kg, grade, finalAmount: r.finalAmount, tokenAmount: r.tokenAmount, balance: r.balanceAtLoading }
      : { kind: 'grade_not_accepted', buyerNameUr, weighedKg: kg, grade },
  );

  return (
    <div className="flex flex-col gap-4">
      <PromptHeading clip="collection_intro" autoPlay />
      <div className="flex items-start gap-3 rounded-2xl border border-attn/30 bg-attn-soft p-4">
        <p className="flex-1 text-lg font-semibold leading-[2] text-ink">{text}</p>
        <SpeakButton autoPlay text={text} />
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <span className="text-4xl font-semibold text-ink">
            <span dir="ltr" className="tabular-nums">
              {kg.toLocaleString('en-IN')}
            </span>{' '}
            <span className="text-xl font-normal text-ink-muted">کلو</span>
          </span>
          <span className="text-xl text-ink-muted">
            <span dir="ltr" className="tabular-nums">
              {kgToMann(kg).toLocaleString('en-IN')}
            </span>{' '}
            من
          </span>
        </div>
        <div className="p-3">
          <GradeCard grade={grade} />
        </div>
        {r.outcome === 'payable' ? (
          <div className="flex flex-col gap-2 border-t border-line p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-lg text-ink-muted">کل</span>
              <MoneyBig amount={r.finalAmount} className="!text-4xl" />
            </div>
            <div className="flex items-baseline justify-between gap-3 text-lg">
              <span className="text-ink-muted">ٹوکن</span>
              <span dir="ltr" className="tabular-nums text-ink-muted">
                − {formatRsPK(r.tokenAmount)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
              <span className="text-xl font-semibold text-ink">باقی</span>
              <span dir="ltr" className="text-3xl font-semibold tabular-nums text-ink">
                {formatRsPK(r.balanceAtLoading)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 border-t border-line bg-danger-soft p-4 text-danger">
            <Ban className="size-8" strokeWidth={1.5} aria-hidden />
          </div>
        )}
      </div>

      <PromptHeading clip="collection_choice" autoPlay size="md" />

      <ActionBar>
        <BigButton variant="go" icon={<Check strokeWidth={2.5} aria-hidden />} busy={busy} onClick={() => act(() => farmerConfirm(sauda.id))}>
          ٹھیک ہے
        </BigButton>
        <BigButton variant="stop" icon={<X strokeWidth={2} aria-hidden />} disabled={busy} onClick={() => setDisputing(true)}>
          گریڈ غلط ہے
        </BigButton>
      </ActionBar>

      <DisputeSheet open={disputing} saudaId={sauda.id} onClose={() => setDisputing(false)} />
    </div>
  );
}
