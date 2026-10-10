'use client';
// Pakka Sauda: speaks a dynamic Urdu sentence (from lib/voice/phrases.ts). Owner: Workstream C. Props FROZEN.
// PHASE 0 STUB: uses the browser's own speech synthesis. Step C1.3 switches it to /api/voice/tts (Uplift AI)
// with the browser voice as fallback.
import { useEffect } from 'react';

export interface SpeakButtonProps {
  text: string;
  autoPlay?: boolean;
  label?: string; // visible label under the speaker icon, optional
  className?: string;
}

export function SpeakButton({ text, autoPlay = false, label, className }: SpeakButtonProps) {
  const speak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ur-PK';
    window.speechSynthesis.speak(u);
  };
  useEffect(() => {
    if (autoPlay) speak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <button type="button" onClick={speak} aria-label="سنیں / Listen" className={className ?? 'flex flex-col items-center gap-1'}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">🔊</span>
      {label ? <span className="text-sm">{label}</span> : null}
    </button>
  );
}
