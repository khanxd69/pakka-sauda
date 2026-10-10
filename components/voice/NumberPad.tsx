'use client';
// Pakka Sauda: 3x4 number pad (1-9, backspace, 0, clear). Owner: Workstream C. No phone keyboard ever pops up.
export type PadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'back' | 'clear';

const KEYS: PadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'clear'];

export function NumberPad({ onKey }: { onKey: (key: PadKey) => void }) {
  return (
    <div dir="ltr" className="grid grid-cols-3 gap-2">
      {KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          aria-label={k === 'back' ? 'Backspace' : k === 'clear' ? 'Clear' : k}
          className={`h-16 min-h-16 rounded-2xl text-3xl font-bold shadow-sm active:scale-95 ${
            k === 'back' || k === 'clear' ? 'bg-stone-200 text-stone-700' : 'bg-white text-stone-900 border border-stone-300'
          }`}
        >
          {k === 'back' ? '⌫' : k === 'clear' ? 'C' : k}
        </button>
      ))}
    </div>
  );
}
