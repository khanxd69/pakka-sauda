'use client';
// Pakka Sauda: F11b settled summary and the cancelled screen. Owner: Workstream B.
import { Ban, CircleCheck } from 'lucide-react';
import { formatRsPK, kgToMann } from '@/lib/format';
import type { CancelReason, SaudaView } from '@/lib/types';
import { urduDate } from '@/lib/voice/urdu-number';
import { GradeCard } from './GradeCard';
import { PromptHeading } from './PromptHeading';

export function SettledPanel({ sauda }: { sauda: SaudaView }) {
  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/25 bg-success-soft p-5 text-center">
        <CircleCheck className="size-14 text-success" strokeWidth={1.5} aria-hidden />
        <PromptHeading clip="settled" autoPlay size="md" />
        {sauda.final_amount != null ? (
          <span dir="ltr" className="text-5xl font-semibold tabular-nums tracking-tight text-ink">
            {formatRsPK(sauda.final_amount)}
          </span>
        ) : null}
      </div>
      <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {sauda.weighed_kg != null ? (
          <div className="flex items-center justify-between gap-3 p-4 text-xl">
            <span>
              <span dir="ltr" className="font-semibold tabular-nums">
                {sauda.weighed_kg.toLocaleString('en-IN')}
              </span>{' '}
              کلو
            </span>
            <span className="text-ink-muted">
              <span dir="ltr" className="tabular-nums">
                {kgToMann(sauda.weighed_kg).toLocaleString('en-IN')}
              </span>{' '}
              من
            </span>
          </div>
        ) : null}
        {grade ? (
          <div className="p-3">
            <GradeCard grade={grade} />
          </div>
        ) : null}
        {sauda.settled_at ? <div className="p-4 text-lg text-ink-muted">{urduDate(sauda.settled_at)}</div> : null}
      </div>
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
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-subtle p-6 text-center">
      <Ban className="size-12 text-ink-muted" strokeWidth={1.5} aria-hidden />
      <span className="text-2xl font-bold leading-[1.9] text-ink">{(sauda.cancel_reason && CANCEL_UR[sauda.cancel_reason]) ?? 'سودا منسوخ'}</span>
      {sauda.token_to ? (
        <span className="text-lg text-ink-muted">
          ٹوکن: {sauda.token_to === 'farmer' ? 'آپ' : 'خریدار'}{' '}
          <span dir="ltr" className="tabular-nums">
            ({formatRsPK(sauda.terms.token_amount)})
          </span>
        </span>
      ) : null}
    </div>
  );
}
