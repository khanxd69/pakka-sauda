'use client';
// Pakka Sauda: F5: the farmer DESCRIBES his potatoes in his own words (size, marks, firmness). A fixed keyword
// reader (lib/voice/understand.ts, no AI) SUGGESTS a grade, reads it back, and he confirms it or picks another
// grade from plain text buttons. Owner: Workstream B.
import { Check, RotateCcw } from 'lucide-react';
import { playUrl, schedule } from '@/components/voice/player';
import { SpeakButton } from '@/components/voice/SpeakButton';
import { VoiceCapture } from '@/components/voice/VoiceCapture';
import type { Grade } from '@/lib/types';
import { clipUrl } from '@/lib/voice/clips';
import { readBackQuality } from '@/lib/voice/phrases';
import { readQuality } from '@/lib/voice/understand';
import { GRADE_LABEL_UR } from './GradeCard';

const GRADES: Grade[] = ['A', 'B', 'C'];
const LETTER: Record<Grade, string> = { A: 'bg-success-soft text-success', B: 'bg-warning-soft text-warning', C: 'bg-danger-soft text-danger' };

export function QualityStep({
  description,
  suggested,
  value,
  onDescribe,
  onPick,
}: {
  description: string | null;
  suggested: Grade | null;
  value: Grade | null;
  onDescribe: (description: string, suggested: Grade | null) => void;
  onPick: (grade: Grade) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <VoiceCapture
        onTranscript={(t) => {
          if (!t) return void schedule(() => playUrl(clipUrl('mic_retry')), 'now');
          const r = readQuality(t);
          onDescribe(t, r.grade);
          if (!r.grade) void schedule(() => playUrl(clipUrl('mic_retry')), 'now');
        }}
      />

      {description ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <p className="text-xl leading-[2] text-ink">“{description}”</p>
          {suggested ? (
            <div className="flex items-start gap-3 rounded-xl border border-attn/30 bg-attn-soft p-3">
              <p className="flex-1 text-lg font-semibold leading-[2] text-ink">{readBackQuality({ grade: suggested, description })}</p>
              <SpeakButton autoPlay text={readBackQuality({ grade: suggested, description })} />
            </div>
          ) : null}
          {suggested ? (
            <button
              type="button"
              onClick={() => onPick(suggested)}
              className="flex min-h-14 items-center justify-center gap-3 rounded-xl bg-brand text-xl font-semibold text-white shadow-card transition-colors hover:bg-brand-hover"
            >
              <Check className="size-6" strokeWidth={2.5} aria-hidden />
              ٹھیک ہے
            </button>
          ) : (
            <p className="flex items-center gap-2 text-lg text-ink-muted">
              <RotateCcw className="size-5" strokeWidth={1.5} aria-hidden />
              <span dir="ltr" className="text-sm">
                Not understood: speak again, or choose below
              </span>
            </p>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Grade">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={value === g}
            onClick={() => onPick(g)}
            className={`flex min-h-14 items-center gap-3 rounded-xl border bg-surface px-4 text-right transition-colors duration-150 ${
              value === g ? 'border-brand ring-2 ring-brand/20' : suggested === g ? 'border-attn/50' : 'border-line'
            }`}
          >
            <span dir="ltr" className={`rounded-md px-2 py-0.5 text-lg font-bold ${LETTER[g]}`}>
              {g}
            </span>
            <span className="flex-1 text-lg leading-[1.9] text-ink">{GRADE_LABEL_UR[g]}</span>
            {value === g ? <Check className="size-5 text-brand" strokeWidth={2.5} aria-hidden /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
