'use client';
// Pakka Sauda: F4 "ready when" calendar tiles. Owner: Workstream B.
import { READY_UR, type ReadyWhen } from '@/lib/voice/phrases';

const ICON: Record<ReadyWhen, string> = { this_week: '/img/week-this.svg', next_week: '/img/week-next.svg', two_weeks: '/img/week-two.svg' };
export const READY_OPTIONS: ReadyWhen[] = ['this_week', 'next_week', 'two_weeks'];

export function ReadyTiles({ value, onSelect }: { value: ReadyWhen | null; onSelect: (r: ReadyWhen) => void }) {
  return (
    <div className="flex flex-col gap-3">
      {READY_OPTIONS.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onSelect(r)}
          aria-pressed={value === r}
          className={`flex min-h-24 items-center gap-4 rounded-2xl border-4 bg-white p-3 text-3xl font-bold active:scale-[0.98] ${
            value === r ? 'border-[#15803d] bg-green-50' : 'border-stone-200'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON[r]} alt="" className="h-16 w-16" />
          {READY_UR[r]}
        </button>
      ))}
    </div>
  );
}
