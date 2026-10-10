'use client';
// Pakka Sauda: F11b settled summary and the cancelled screen. Owner: Workstream B.
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { formatRsPK, kgToMann } from '@/lib/format';
import type { CancelReason, SaudaView } from '@/lib/types';
import { urduDate } from '@/lib/voice/urdu-number';
import { GradeCard } from './GradeCard';

export function SettledPanel({ sauda }: { sauda: SaudaView }) {
  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-green-100 p-5 text-center">
      <AudioPrompt clip="settled" autoPlay />
      <span className="text-7xl">✅</span>
      {sauda.final_amount != null ? (
        <span dir="ltr" className="text-5xl font-bold tabular-nums text-green-900">{formatRsPK(sauda.final_amount)}</span>
      ) : null}
      {sauda.weighed_kg != null ? (
        <span dir="ltr" className="text-2xl tabular-nums">
          {sauda.weighed_kg.toLocaleString('en-IN')} کلو · {kgToMann(sauda.weighed_kg).toLocaleString('en-IN')} من
        </span>
      ) : null}
      {grade ? <GradeCard grade={grade} /> : null}
      {sauda.settled_at ? <span className="text-xl">📅 {urduDate(sauda.settled_at)}</span> : null}
    </div>
  );
}

const CANCEL_UR: Partial<Record<CancelReason, string>> = {
  grade_not_accepted: 'خریدار نے یہ گریڈ نہیں لیا',
  buyer_walked_away: 'خریدار پیچھے ہٹ گیا، ٹوکن آپ کا ہے',
  token_expired: 'ٹوکن وقت پر نہیں آیا',
};

export function CancelledPanel({ sauda }: { sauda: SaudaView }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-stone-200 p-5 text-center">
      <span className="text-7xl">🚫</span>
      <span className="text-2xl font-bold">{(sauda.cancel_reason && CANCEL_UR[sauda.cancel_reason]) ?? 'سودا منسوخ'}</span>
      {sauda.token_to ? (
        <span className="text-xl">
          ٹوکن: {sauda.token_to === 'farmer' ? 'آپ' : 'خریدار'} <span dir="ltr" className="tabular-nums">({formatRsPK(sauda.terms.token_amount)})</span>
        </span>
      ) : null}
    </div>
  );
}
