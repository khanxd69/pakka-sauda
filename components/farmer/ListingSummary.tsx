'use client';
// Pakka Sauda: F7 read-back card: range in kg and mann, ready, grade, minimum per mann. Owner: Workstream B.
import { estimateToRange, formatRsPK, kgToMann } from '@/lib/format';
import type { Grade } from '@/lib/types';
import { READY_UR, type ReadyWhen } from '@/lib/voice/phrases';
import { GradeCard } from './GradeCard';

const READY_ICON: Record<ReadyWhen, string> = { this_week: '/img/week-this.svg', next_week: '/img/week-next.svg', two_weeks: '/img/week-two.svg' };

export function ListingSummary(a: { estimateKg: number; ready: ReadyWhen; expectedGrade: Grade; minPricePerMann: number }) {
  const r = estimateToRange(a.estimateKg);
  return (
    <div className="flex flex-col gap-3 rounded-3xl border-2 border-stone-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <span className="text-5xl">🥔</span>
        <div className="flex flex-col" dir="ltr">
          <span className="text-2xl font-bold tabular-nums">
            {r.low.toLocaleString('en-IN')} – {r.high.toLocaleString('en-IN')} کلو
          </span>
          <span className="text-xl text-stone-600 tabular-nums">
            {kgToMann(r.low).toLocaleString('en-IN')} – {kgToMann(r.high).toLocaleString('en-IN')} من
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-2xl font-bold">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={READY_ICON[a.ready]} alt="" className="h-14 w-14" />
        {READY_UR[a.ready]}
      </div>
      <GradeCard grade={a.expectedGrade} />
      <div className="text-center">
        <div className="text-3xl font-bold">
          <span dir="ltr" className="tabular-nums">{formatRsPK(a.minPricePerMann)}</span> / من
        </div>
      </div>
    </div>
  );
}
