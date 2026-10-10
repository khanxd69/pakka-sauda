'use client';
// Pakka Sauda: 3x4 number pad (1-9, backspace, 0, clear). Owner: Workstream C. No phone keyboard ever pops up.
import { Delete } from 'lucide-react';

export type PadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'back' | 'clear';

const KEYS: PadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

export function NumberPad({ onKey }: { onKey: (key: PadKey) => void }) {
  return (
    <div dir="ltr" className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          aria-label={k === 'back' ? 'Backspace' : k === 'clear' ? 'Clear' : k}
          className={`flex h-16 items-center justify-center rounded-xl text-2xl font-medium tabular-nums transition-colors duration-150 active:scale-[0.97] ${
            k === 'back' || k === 'clear' ? 'bg-subtle text-ink-muted' : 'border border-line bg-surface text-ink shadow-card active:bg-subtle'
          }`}
        >
          {k === 'back' ? <Delete className="size-6" strokeWidth={1.5} aria-hidden /> : k === 'clear' ? <span className="text-base font-semibold">C</span> : k}
        </button>
      ))}
    </div>
  );
}
