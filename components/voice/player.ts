'use client';
// Pakka Sauda: one audio channel for the whole farmer app. Owner: Workstream C.
// autoPlay prompts QUEUE (F1 welcome -> new offers, F7 read-back -> confirm hint); a tap INTERRUPTS everything.
// Covers both MP3 clips / TTS blobs and the browser speechSynthesis fallback, so two sounds never overlap.

export type Outcome = 'played' | 'blocked' | 'failed' | 'cancelled';

let generation = 0;
let stopCurrent: (() => void) | null = null;
let tail: Promise<unknown> = Promise.resolve();

/** Stop whatever is playing and drop everything queued. */
export function stopAll(): void {
  generation++;
  stopCurrent?.();
  stopCurrent = null;
  tail = Promise.resolve();
}

/** Play one URL; resolves when it ends (or is stopped / blocked by the autoplay policy). */
export function playUrl(url: string): Promise<Outcome> {
  return new Promise((resolve) => {
    const a = new Audio(url);
    stopCurrent = () => {
      a.pause();
      resolve('cancelled');
    };
    a.onended = () => resolve('played');
    a.onerror = () => resolve('failed');
    a.play().catch((e: unknown) => resolve(e instanceof DOMException && e.name === 'NotAllowedError' ? 'blocked' : 'failed'));
  });
}

function urduVoice(): SpeechSynthesisVoice | null | undefined {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return undefined; // not loaded yet: let the browser pick by lang
  return voices.find((v) => v.lang.toLowerCase().startsWith('ur')) ?? null;
}

/** Browser voice fallback. 'failed' when the phone has no Urdu voice. */
export function speakBrowser(text: string): Promise<Outcome> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve('failed');
    const voice = urduVoice();
    if (voice === null) return resolve('failed');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ur-PK';
    if (voice) u.voice = voice;
    stopCurrent = () => {
      window.speechSynthesis.cancel();
      resolve('cancelled');
    };
    u.onend = () => resolve('played');
    u.onerror = (e) => resolve(e.error === 'not-allowed' ? 'blocked' : 'failed');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}

/** 'now' interrupts and plays immediately; 'queue' plays after the previously queued sound finishes. */
export function schedule(job: () => Promise<Outcome>, mode: 'now' | 'queue'): Promise<Outcome> {
  if (mode === 'now') stopAll();
  const mine = generation;
  const p = tail.then(() => (mine === generation ? job() : ('cancelled' as Outcome)));
  tail = p.catch(() => undefined);
  return p;
}
