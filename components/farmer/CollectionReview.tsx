'use client';
// Pakka Sauda: F10: the buyer recorded weight and grade; the farmer hears the amount and confirms or disputes. Owner: B.
import { useState } from 'react';
import { farmerConfirm } from '@/app/actions/saudas';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { formatRsPK, kgToMann } from '@/lib/format';
import { settle } from '@/lib/settle';
import type { SaudaView } from '@/lib/types';
import { explainCollection } from '@/lib/voice/phrases';
import { BigButton } from './BigButton';
import { DisputeSheet } from './DisputeSheet';
import { GradeCard } from './GradeCard';
import { MoneyBig } from './MoneyBig';
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
      <div className="flex justify-center gap-3">
        <AudioPrompt clip="collection_intro" autoPlay />
        <SpeakButton autoPlay text={text} />
        <AudioPrompt clip="collection_choice" autoPlay />
      </div>

      <div className="flex flex-col items-center rounded-3xl bg-white p-4" dir="ltr">
        <span className="text-5xl font-bold tabular-nums">{kg.toLocaleString('en-IN')} کلو</span>
        <span className="text-2xl text-stone-600 tabular-nums">{kgToMann(kg).toLocaleString('en-IN')} من</span>
      </div>
      <GradeCard grade={grade} />

      {r.outcome === 'payable' ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-green-50 p-4">
          <MoneyBig amount={r.finalAmount} />
          <div className="flex w-full justify-between text-xl">
            <span>ٹوکن ✓</span>
            <span dir="ltr" className="tabular-nums">{formatRsPK(r.tokenAmount)}</span>
          </div>
          <div className="flex w-full justify-between text-2xl font-bold">
            <span>باقی</span>
            <span dir="ltr" className="tabular-nums">{formatRsPK(r.balanceAtLoading)}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-red-50 p-4 text-center text-6xl">🚫</div>
      )}

      <BigButton variant="go" icon="✓" busy={busy} onClick={() => act(() => farmerConfirm(sauda.id))}>
        ٹھیک ہے
      </BigButton>
      <BigButton variant="stop" icon="✗" disabled={busy} onClick={() => setDisputing(true)}>
        گریڈ غلط ہے
      </BigButton>

      <DisputeSheet open={disputing} saudaId={sauda.id} onClose={() => setDisputing(false)} />
    </div>
  );
}
