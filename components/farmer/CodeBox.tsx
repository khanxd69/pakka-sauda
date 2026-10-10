// Pakka Sauda: F9 one-time collection code, huge and high contrast, readable from a metre away. Owner: Workstream B.
import { AudioPrompt } from '@/components/voice/AudioPrompt';

export function CodeBox({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl bg-black p-5 text-white">
      <div className="flex items-center gap-3">
        <AudioPrompt clip="collection_code" autoPlay className="h-14 w-14 rounded-full bg-amber-300 text-2xl text-black" />
        <span className="text-xl">خریدار کو یہ نمبر دکھائیں</span>
      </div>
      <span dir="ltr" className="font-mono text-8xl font-black tracking-[0.2em] tabular-nums">
        {code}
      </span>
    </div>
  );
}
