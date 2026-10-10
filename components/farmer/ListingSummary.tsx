'use client';
// Pakka Sauda: F7 read-back card: range in kg and mann, ready, grade, minimum per mann. Owner: Workstream B.
import { estimateToRange, formatRsPK, kgToMann } from '@/lib/format';
import type { Grade } from '@/lib/types';
import { READY_UR, type ReadyWhen } from '@/lib/voice/phrases';
import { GRADE_LABEL_UR } from './GradeCard';

const READY_ICON: Record<ReadyWhen, string> = { this_week: '/img/week-this.svg', next_week: '/img/week-next.svg', two_weeks: '/img/week-two.svg' };

const LETTER: Record<Grade, string> = { A: 'bg-success-soft text-success', B: 'bg-warning-soft text-warning', C: 'bg-danger-soft text-danger' };

export function ListingSummary(a: { estimateKg: number; ready: ReadyWhen; expectedGrade: Grade; minPricePerMann: number; qualityText?: string | null }) {
  const r = estimateToRange(a.estimateKg);
  return (
    <div className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center gap-4 p-4">
        <span className="text-3xl font-bold text-ink">آلو</span>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold text-ink">
            <span dir="ltr" className="tabular-nums">
              {r.low.toLocaleString('en-IN')} – {r.high.toLocaleString('en-IN')}
            </span>{' '}
            کلو
          </span>
          <span className="text-base text-ink-muted">
            <span dir="ltr" className="tabular-nums">
              {kgToMann(r.low).toLocaleString('en-IN')} – {kgToMann(r.high).toLocaleString('en-IN')}
            </span>{' '}
            من
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 text-2xl font-semibold text-ink">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-subtle">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={READY_ICON[a.ready]} alt="" className="size-10" />
        </span>
        <span className="leading-[1.9]">{READY_UR[a.ready]}</span>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-3">
          <span dir="ltr" className={`rounded-md px-2 py-0.5 text-xl font-bold ${LETTER[a.expectedGrade]}`}>
            {a.expectedGrade}
          </span>
          <span className="text-lg leading-[1.9] text-ink">{GRADE_LABEL_UR[a.expectedGrade]}</span>
        </div>
        {a.qualityText ? <p className="text-lg leading-[1.9] text-ink-muted">“{a.qualityText}”</p> : null}
      </div>
      <div className="flex items-baseline justify-center gap-2 p-4">
        <span dir="ltr" className="text-3xl font-semibold tabular-nums text-ink">
          {formatRsPK(a.minPricePerMann)}
        </span>
        <span className="text-lg text-ink-muted">/ من</span>
      </div>
    </div>
  );
}
