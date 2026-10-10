'use client';
// Pakka Sauda: the farmer picks the grade he believes, plus optional reason chips (no typing). Owner: Workstream B.
import { useState } from 'react';
import { farmerDispute } from '@/app/actions/saudas';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import type { Grade } from '@/lib/types';
import { BigButton } from './BigButton';
import { GradeCard } from './GradeCard';
import { useFarmerAction } from './useFarmerAction';

const REASONS = ['آلو بڑے ہیں', 'داغ کم ہیں', 'وزن غلط ہے'];
const GRADES: Grade[] = ['A', 'B', 'C'];

export function DisputeSheet({ open, saudaId, onClose }: { open: boolean; saudaId: string; onClose: () => void }) {
  const { busy, act } = useFarmerAction();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  if (!open) return null;

  const toggle = (r: string) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : rs.concat(r)));
  async function submit() {
    if (!grade) return;
    const ok = await act(() => farmerDispute({ saudaId, claimedGrade: grade, reason: reasons.join('، ') || undefined }));
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" role="dialog" aria-modal="true">
      <div className="mx-auto flex max-h-[92dvh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
        <div className="flex justify-center">
          <AudioPrompt clip="dispute_grade_ask" autoPlay />
        </div>
        {GRADES.map((g) => (
          <GradeCard key={g} grade={g} selected={grade === g} onSelect={() => setGrade(g)} />
        ))}
        <div className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggle(r)}
              aria-pressed={reasons.includes(r)}
              className={`min-h-14 rounded-full border-2 px-4 text-xl ${reasons.includes(r) ? 'border-[#b91c1c] bg-red-50 font-bold' : 'border-stone-300 bg-white'}`}
            >
              {r}
            </button>
          ))}
        </div>
        <BigButton variant="stop" icon="✓" busy={busy} disabled={!grade} onClick={submit}>
          گریڈ غلط ہے
        </BigButton>
        <BigButton variant="plain" icon="✗" disabled={busy} onClick={onClose}>
          نہیں
        </BigButton>
      </div>
    </div>
  );
}
