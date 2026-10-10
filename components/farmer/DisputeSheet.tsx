'use client';
// Pakka Sauda: the farmer picks the grade he believes, plus optional reason chips (no typing). Owner: Workstream B.
import { useState } from 'react';
import { uploadEvidence } from '@/app/actions/evidence';
import { farmerDispute } from '@/app/actions/saudas';
import { CameraCapture } from '@/components/media/CameraCapture';
import { playUrl, schedule } from '@/components/voice/player';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import type { Grade } from '@/lib/types';
import { clipUrl } from '@/lib/voice/clips';
import { BigButton } from './BigButton';
import { GradeCard } from './GradeCard';
import { useFarmerAction } from './useFarmerAction';

const REASONS = ['آلو بڑے ہیں', 'داغ کم ہیں', 'وزن غلط ہے'];
const GRADES: Grade[] = ['A', 'B', 'C'];

export function DisputeSheet({ open, saudaId, onClose }: { open: boolean; saudaId: string; onClose: () => void }) {
  const { busy, act } = useFarmerAction();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [photo, setPhoto] = useState<{ file: File; coords: { lat: number; lng: number } | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  if (!open) return null;

  const toggle = (r: string) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : rs.concat(r)));
  async function submit() {
    if (!grade) return;
    if (photo) {
      // A failed upload never blocks the dispute: play error_generic and submit without the photo.
      setUploading(true);
      const form = new FormData();
      form.set('saudaId', saudaId);
      form.set('kind', 'dispute');
      form.set('file', photo.file);
      if (photo.coords) {
        form.set('lat', String(photo.coords.lat));
        form.set('lng', String(photo.coords.lng));
      }
      const up = await uploadEvidence(form).catch(() => null);
      setUploading(false);
      if (!up?.ok) void schedule(() => playUrl(clipUrl('error_generic')), 'now');
    }
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
        <CameraCapture hint="اپنے آلو کی تصویر لیں" onCapture={(file, coords) => setPhoto({ file, coords })} />
        <BigButton variant="stop" icon="✓" busy={busy || uploading} disabled={!grade} onClick={submit}>
          گریڈ غلط ہے
        </BigButton>
        <BigButton variant="plain" icon="✗" disabled={busy || uploading} onClick={onClose}>
          نہیں
        </BigButton>
      </div>
    </div>
  );
}
