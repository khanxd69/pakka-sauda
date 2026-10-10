'use client';
// Pakka Sauda: plays a fixed Urdu prompt. Owner: Workstream C. Props FROZEN (contracts-v1).
// Phase 0 version already works if public/audio/ur/<clip>.mp3 exists. C polishes it in step C1.2.
// Browsers block sound until the user has tapped once on the page; the "choose user" tap counts.
import { useEffect, useRef } from 'react';
import { clipUrl, type ClipId } from '@/lib/voice/clips';

export interface AudioPromptProps {
  clip: ClipId;
  autoPlay?: boolean; // play once when mounted
  className?: string;
}

export function AudioPrompt({ clip, autoPlay = false, className }: AudioPromptProps) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const play = () => {
    audio.current?.pause();
    audio.current = new Audio(clipUrl(clip));
    audio.current.play().catch(() => {});
  };
  useEffect(() => {
    if (autoPlay) play();
    return () => audio.current?.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip]);
  return (
    <button type="button" onClick={play} aria-label="دوبارہ سنیں / Play again" className={className ?? 'h-16 w-16 rounded-full bg-amber-100 text-3xl'}>
      🔊
    </button>
  );
}
