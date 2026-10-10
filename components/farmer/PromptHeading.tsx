'use client';
// Pakka Sauda: a screen's question, readable AND spoken: the Urdu text of the clip next to its audio button.
// Text comes from lib/voice/clips.json (the same approved sentence the audio says). Owner: Workstream B.
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { CLIPS, type ClipId } from '@/lib/voice/clips';

export function PromptHeading({ clip, autoPlay = false, size = 'lg' }: { clip: ClipId; autoPlay?: boolean; size?: 'lg' | 'md' }) {
  return (
    <div className="flex items-start gap-3">
      <p className={`flex-1 font-semibold text-ink ${size === 'lg' ? 'text-2xl leading-[2]' : 'text-lg leading-[1.9]'}`}>{CLIPS[clip].ur}</p>
      <AudioPrompt clip={clip} autoPlay={autoPlay} />
    </div>
  );
}
