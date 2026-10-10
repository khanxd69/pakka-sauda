'use client';
// Pakka Sauda: plays a fixed Urdu prompt. Owner: Workstream C. Props FROZEN (contracts-v1).
// autoPlay prompts queue behind each other; tapping the button interrupts and replays (components/voice/player.ts).
// Browsers block sound until the user has tapped once on the page; the "choose user" tap counts. If play() is
// blocked, the replay button pulses so the farmer knows to tap it. A small waveform shows while it plays.
import { Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clipUrl, type ClipId } from '@/lib/voice/clips';
import { playUrl, schedule, stopAll } from './player';

export interface AudioPromptProps {
  clip: ClipId;
  autoPlay?: boolean; // play once when mounted
  className?: string;
}

export function Wave() {
  return (
    <span className="ps-wave flex h-4 items-center gap-[3px]" aria-hidden>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function AudioPrompt({ clip, autoPlay = false, className }: AudioPromptProps) {
  const [blocked, setBlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const run = (mode: 'now' | 'queue') =>
    schedule(async () => {
      setPlaying(true);
      const o = await playUrl(clipUrl(clip));
      setPlaying(false);
      return o;
    }, mode).then((o) => {
      setPlaying(false);
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
      className={`relative inline-flex h-14 min-w-14 shrink-0 items-center justify-center gap-2 rounded-full bg-attn-soft px-4 text-attn ring-1 ring-inset ring-attn/20 transition-transform duration-150 active:scale-95 ${className ?? ''}`}
    >
      {blocked ? <span className="absolute inset-0 animate-ping rounded-full ring-2 ring-attn/50" aria-hidden /> : null}
      <Volume2 className="size-6" strokeWidth={1.75} aria-hidden />
      {playing ? <Wave /> : null}
    </button>
  );
}
