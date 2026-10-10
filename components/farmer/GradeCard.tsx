'use client';
// Pakka Sauda: a grade picture card (photo if present, else a flat illustration) with a one-line Urdu label. Owner: B.
import { Check } from 'lucide-react';
import { useState } from 'react';
import type { Grade } from '@/lib/types';
import { PotatoArt } from './PotatoArt';

export const GRADE_LABEL_UR: Record<Grade, string> = {
  A: 'بڑے، سخت، بہت کم داغ',
  B: 'درمیانے یا کچھ داغ',
  C: 'چھوٹے یا زیادہ داغ',
};
const LETTER: Record<Grade, string> = { A: 'bg-success-soft text-success', B: 'bg-warning-soft text-warning', C: 'bg-danger-soft text-danger' };

export function GradeCard({ grade, selected = false, onSelect }: { grade: Grade; selected?: boolean; onSelect?: () => void }) {
  const [photo, setPhoto] = useState(true);
  const body = (
    <>
      <span className="relative size-20 shrink-0 overflow-hidden rounded-xl">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/img/grade-${grade.toLowerCase()}.jpg`} alt="" className="size-full object-cover" onError={() => setPhoto(false)} />
        ) : (
          <PotatoArt kind={grade} className="size-full" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <span dir="ltr" className={`rounded-md px-2 py-0.5 text-lg font-bold ${LETTER[grade]}`}>
          {grade}
        </span>
        <span className="text-lg leading-[1.9] text-ink">{GRADE_LABEL_UR[grade]}</span>
      </span>
      {onSelect ? (
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${selected ? 'border-brand bg-brand text-white' : 'border-line-strong'}`}
          aria-hidden
        >
          {selected ? <Check className="size-4" strokeWidth={3} /> : null}
        </span>
      ) : null}
    </>
  );
  const cls = `flex w-full items-center gap-4 rounded-2xl border bg-surface p-3 text-right shadow-card transition-colors duration-150 ${
    selected ? 'border-brand ring-2 ring-brand/20' : 'border-line'
  }`;
  return onSelect ? (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={`${cls} min-h-24 hover:border-line-strong`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
