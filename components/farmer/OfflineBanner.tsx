'use client';
// Pakka Sauda: plays the `offline` clip and shows a banner while the phone has no connection. Owner: Workstream B.
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { useOnline } from '@/components/voice/useOnline';

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="sticky top-16 z-20 flex items-center justify-center gap-3 bg-red-700 px-4 py-2 text-xl text-white" role="status">
      <AudioPrompt clip="offline" autoPlay className="h-12 w-12 rounded-full bg-white/20 text-2xl" />
      📵
    </div>
  );
}
