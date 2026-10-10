'use client';
// Pakka Sauda: speaks a dynamic Urdu sentence (from lib/voice/phrases.ts). Owner: Workstream C. Props FROZEN.
// Fetches GET /api/voice/tts (Uplift AI); falls back to the browser voice (ur-PK) on any error or when
// NEXT_PUBLIC_TTS_DISABLED=1. Object URLs are cached per text, so a replay makes no network call.
import { LoaderCircle, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Wave } from './AudioPrompt';
import { playUrl, schedule, speakBrowser, stopAll } from './player';

export interface SpeakButtonProps {
  text: string;
  autoPlay?: boolean;
  label?: string; // visible label under the speaker icon, optional
  className?: string;
}

const urlCache = new Map<string, string>();

async function ttsUrl(text: string): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_TTS_DISABLED === '1') return null;
  const hit = urlCache.get(text);
  if (hit) return hit;
  try {
    const res = await fetch(`/api/voice/tts?text=${encodeURIComponent(text)}`);
    if (!res.ok) return null;
    const url = URL.createObjectURL(await res.blob());
    urlCache.set(text, url);
    return url;
  } catch {
    return null;
  }
}

export function SpeakButton({ text, autoPlay = false, label, className }: SpeakButtonProps) {
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  const run = (mode: 'now' | 'queue') =>
    schedule(async () => {
      setLoading(!urlCache.has(text));
      const url = await ttsUrl(text);
      setLoading(false);
      setPlaying(true);
      try {
        if (url) {
          const o = await playUrl(url);
          if (o !== 'failed') return o;
        }
        return await speakBrowser(text);
      } finally {
        setPlaying(false);
      }
    }, mode).then((o) => {
      setPlaying(false);
      setBlocked(o === 'blocked');
      setUnavailable(o === 'failed');
    });

  useEffect(() => {
    if (autoPlay) void run('queue');
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void run('now')}
      aria-label="سنیں / Listen"
      title={unavailable ? 'Audio unavailable' : undefined}
      className={className ?? 'inline-flex shrink-0 flex-col items-center gap-1'}
    >
      <span className="relative inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-attn-soft px-4 text-attn ring-1 ring-inset ring-attn/20 transition-transform duration-150 active:scale-95">
        {blocked ? <span className="absolute inset-0 animate-ping rounded-full ring-2 ring-attn/50" aria-hidden /> : null}
        {loading ? <LoaderCircle className="size-6 animate-spin" strokeWidth={1.75} aria-hidden /> : <Volume2 className="size-6" strokeWidth={1.75} aria-hidden />}
        {playing && !loading ? <Wave /> : null}
      </span>
      {label ? <span className="text-sm text-ink-muted">{label}</span> : null}
      {unavailable ? (
        <span dir="ltr" className="text-xs text-ink-muted">
          Audio unavailable
        </span>
      ) : null}
    </button>
  );
}
