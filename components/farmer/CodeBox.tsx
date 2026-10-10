// Pakka Sauda: F9 one-time collection code: bordered, high contrast, readable from a metre away. Owner: Workstream B.
import { KeyRound } from 'lucide-react';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { CLIPS } from '@/lib/voice/clips';

export function CodeBox({ code }: { code: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border-[3px] border-ink bg-surface p-4">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-2 size-6 shrink-0 text-ink" strokeWidth={1.75} aria-hidden />
        <p className="flex-1 text-lg font-semibold leading-[1.9] text-ink">خریدار کو یہ نمبر دکھائیں</p>
        <AudioPrompt clip="collection_code" autoPlay />
      </div>
      <span dir="ltr" className="text-center font-mono text-7xl font-bold tracking-[0.25em] text-ink tabular-nums">
        {code}
      </span>
      <p className="text-base leading-[1.9] text-ink-muted">{CLIPS.collection_code.ur}</p>
    </div>
  );
}
