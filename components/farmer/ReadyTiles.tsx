'use client';
// Pakka Sauda: F4 "ready when" calendar tiles. Owner: Workstream B.
import { Check } from 'lucide-react';
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
          className={`flex min-h-24 items-center gap-4 rounded-2xl border bg-surface p-3 text-2xl font-semibold shadow-card transition-colors duration-150 active:scale-[0.99] ${
            value === r ? 'border-brand ring-2 ring-brand/20' : 'border-line hover:border-line-strong'
          }`}
        >
          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON[r]} alt="" className="size-12" />
          </span>
          <span className="flex-1 text-right leading-[1.9] text-ink">{READY_UR[r]}</span>
          <span className={`flex size-7 items-center justify-center rounded-full border-2 ${value === r ? 'border-brand bg-brand text-white' : 'border-line-strong'}`} aria-hidden>
            {value === r ? <Check className="size-4" strokeWidth={3} /> : null}
          </span>
        </button>
      ))}
    </div>
  );
}
