'use client';
// Pakka Sauda: speaks a dynamic Urdu sentence (from lib/voice/phrases.ts). Owner: Workstream C. Props FROZEN.
// Fetches GET /api/voice/tts (Uplift AI); falls back to the browser voice (ur-PK) on any error or when
// NEXT_PUBLIC_TTS_DISABLED=1. Object URLs are cached per text, so a replay makes no network call.
import { useEffect, useState } from 'react';
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

  const run = (mode: 'now' | 'queue') =>
    schedule(async () => {
      setLoading(!urlCache.has(text));
      const url = await ttsUrl(text);
      setLoading(false);
      if (url) {
        const o = await playUrl(url);
        if (o !== 'failed') return o;
      }
      return speakBrowser(text);
    }, mode).then((o) => {
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
      className={className ?? 'flex flex-col items-center gap-1'}
    >
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
        {blocked ? <span className="absolute inset-0 animate-ping rounded-full ring-4 ring-amber-400" aria-hidden /> : null}
        {loading ? (
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-amber-300 border-t-amber-700" aria-hidden />
        ) : (
          '🔊'
        )}
      </span>
      {label ? <span className="text-sm">{label}</span> : null}
      {unavailable ? <span className="text-xs text-stone-500">Audio unavailable</span> : null}
    </button>
  );
}
