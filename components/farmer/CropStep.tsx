'use client';
// Pakka Sauda: F2: the farmer SAYS which crop (voice first), with a plain text button as the tap fallback. Owner: B.
// Only potatoes are supported in the MVP; another crop name plays crop_only_potato. Nothing is decided by AI.
import { useState } from 'react';
import { playUrl, schedule } from '@/components/voice/player';
import { VoiceCapture } from '@/components/voice/VoiceCapture';
import { clipUrl } from '@/lib/voice/clips';
import { matchCrop } from '@/lib/voice/understand';

export function CropStep({ onPotato }: { onPotato: (transcript?: string) => void }) {
  const [heard, setHeard] = useState<string | null>(null);
  const say = (clip: 'crop_only_potato' | 'mic_retry') => void schedule(() => playUrl(clipUrl(clip)), 'now');

  return (
    <div className="flex flex-col items-center gap-5 pt-2">
      <VoiceCapture
        onTranscript={(t) => {
          setHeard(t || null);
          const crop = matchCrop(t);
          if (crop === 'potato') onPotato(t);
          else say(crop === 'other' ? 'crop_only_potato' : 'mic_retry');
        }}
      />
      {heard ? (
        <p className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-center text-xl leading-[1.9] text-ink-muted">“{heard}”</p>
      ) : null}
      <button
        type="button"
        onClick={() => onPotato()}
        className="flex min-h-16 w-full items-center justify-center rounded-2xl border border-line-strong bg-surface text-3xl font-bold text-ink shadow-card transition-colors duration-150 hover:border-brand active:scale-[0.99]"
      >
        آلو
      </button>
    </div>
  );
}
