'use client';
// Pakka Sauda: plays a fixed Urdu prompt. Owner: Workstream C. Props FROZEN (contracts-v1).
// autoPlay prompts queue behind each other; tapping the button interrupts and replays (components/voice/player.ts).
// Browsers block sound until the user has tapped once on the page; the "choose user" tap counts. If play() is
// blocked, the replay button pulses so the farmer knows to tap it.
import { useEffect, useState } from 'react';
import { clipUrl, type ClipId } from '@/lib/voice/clips';
import { playUrl, schedule, stopAll } from './player';

export interface AudioPromptProps {
  clip: ClipId;
  autoPlay?: boolean; // play once when mounted
  className?: string;
}

export function AudioPrompt({ clip, autoPlay = false, className }: AudioPromptProps) {
  const [blocked, setBlocked] = useState(false);
  const run = (mode: 'now' | 'queue') =>
    schedule(() => playUrl(clipUrl(clip)), mode).then((o) => {
      if (o === 'blocked') setBlocked(true);
      else if (o === 'played') setBlocked(false);
    });

  useEffect(() => {
    if (autoPlay) void run('queue');
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip]);

  return (
    <button
      type="button"
      onClick={() => {
        setBlocked(false);
        void run('now');
      }}
      aria-label="دوبارہ سنیں / Play again"
      className={`relative ${className ?? 'h-16 w-16 rounded-full bg-amber-100 text-3xl'}`}
    >
      {blocked ? <span className="absolute inset-0 animate-ping rounded-full ring-4 ring-amber-400" aria-hidden /> : null}
      🔊
    </button>
  );
}
