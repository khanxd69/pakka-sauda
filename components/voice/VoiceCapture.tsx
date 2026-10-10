'use client';
// Pakka Sauda: one big mic button that returns what the farmer said (free speech, not a number). Owner: Workstream C.
// Uses the same mic path as VoiceNumberInput (browser ur-PK or Uplift Scribe, from NEXT_PUBLIC_STT_PROVIDER).
// Renders nothing if this phone has no mic support, so the screen's tap fallback is always there.
import { LoaderCircle, Mic, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { micSupported, useMic } from './useMic';

export function VoiceCapture({ onTranscript, disabled = false }: { onTranscript: (transcript: string) => void; disabled?: boolean }) {
  const [canMic, setCanMic] = useState(false);
  useEffect(() => setCanMic(micSupported()), []);
  const mic = useMic(onTranscript);
  if (!canMic) return null;
  const listening = mic.state === 'listening';
  const thinking = mic.state === 'thinking';
  return (
    <button
      type="button"
      onClick={() => (listening ? mic.stop() : void mic.start())}
      disabled={disabled || thinking}
      aria-label={listening ? 'روکیں / Stop' : 'بولیں / Speak'}
      className={`mx-auto flex size-28 items-center justify-center rounded-full text-white shadow-card transition-colors duration-150 disabled:opacity-60 ${
        listening ? 'animate-pulse bg-danger' : thinking ? 'bg-line-strong' : 'bg-brand hover:bg-brand-hover'
      }`}
    >
      {thinking ? (
        <LoaderCircle className="size-10 animate-spin" strokeWidth={1.75} aria-hidden />
      ) : listening ? (
        <Square className="size-9" strokeWidth={1.75} aria-hidden />
      ) : (
        <Mic className="size-11" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
