'use client';
// Pakka Sauda: a grade picture card (photo, else a coloured letter tile) with a one-line Urdu label. Owner: B.
import { useState } from 'react';
import type { Grade } from '@/lib/types';

export const GRADE_LABEL_UR: Record<Grade, string> = {
  A: 'بڑے، سخت، بہت کم داغ',
  B: 'درمیانے یا کچھ داغ',
  C: 'چھوٹے یا زیادہ داغ',
};
const TILE: Record<Grade, string> = { A: 'bg-green-600', B: 'bg-amber-500', C: 'bg-red-600' };

export function GradeCard({ grade, selected = false, onSelect }: { grade: Grade; selected?: boolean; onSelect?: () => void }) {
  const [photo, setPhoto] = useState(true);
  const body = (
    <>
      <span className={`relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl text-white ${TILE[grade]}`}>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/img/grade-${grade.toLowerCase()}.jpg`} alt="" className="h-full w-full object-cover" onError={() => setPhoto(false)} />
        ) : (
          <span className="flex flex-col items-center leading-none">
            <span className="text-2xl">🥔</span>
            <span dir="ltr" className="text-3xl font-black">{grade}</span>
          </span>
        )}
      </span>
      <span className="flex flex-col items-start">
        <span dir="ltr" className="text-3xl font-black">{grade}</span>
        <span className="text-lg">{GRADE_LABEL_UR[grade]}</span>
      </span>
    </>
  );
  const cls = `flex w-full items-center gap-4 rounded-2xl border-4 bg-white p-3 text-right ${
    selected ? 'border-[#15803d] bg-green-50' : 'border-stone-200'
  }`;
  return onSelect ? (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={`${cls} min-h-24 active:scale-[0.98]`}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
