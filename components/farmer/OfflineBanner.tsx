'use client';
// Pakka Sauda: plays the `offline` clip and shows a banner while the phone has no connection. Owner: Workstream B.
import { WifiOff } from 'lucide-react';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { useOnline } from '@/components/voice/useOnline';
import { CLIPS } from '@/lib/voice/clips';

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="sticky top-16 z-20 border-b border-danger/20 bg-danger-soft" role="status">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-2">
        <WifiOff className="size-6 shrink-0 text-danger" strokeWidth={1.5} aria-hidden />
        <span className="flex-1 text-base text-danger">{CLIPS.offline.ur}</span>
        <AudioPrompt clip="offline" autoPlay />
      </div>
    </div>
  );
}
