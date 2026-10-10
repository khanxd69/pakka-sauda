'use client';
// Pakka Sauda: microphone -> transcript. Owner: Workstream C.
// NEXT_PUBLIC_STT_PROVIDER picks the path: 'uplift' records with MediaRecorder (max 6 s) and POSTs to /api/voice/stt;
// 'browser' (default) uses webkitSpeechRecognition with lang ur-PK. Plays mic_listening before listening.
import { useCallback, useEffect, useRef, useState } from 'react';
import { clipUrl } from '@/lib/voice/clips';
import { playUrl, schedule } from './player';

export type MicState = 'idle' | 'listening' | 'thinking';

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

const PROVIDER = process.env.NEXT_PUBLIC_STT_PROVIDER === 'uplift' ? 'uplift' : 'browser';
const MAX_MS = 6000;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function micSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return PROVIDER === 'uplift' ? !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' : !!recognitionCtor();
}

/** onTranscript receives the text ('' when nothing was understood). */
export function useMic(onTranscript: (transcript: string) => void) {
  const [state, setState] = useState<MicState>('idle');
  const stopRef = useRef<(() => void) | null>(null);
  const cb = useRef(onTranscript);
  cb.current = onTranscript;

  useEffect(() => () => stopRef.current?.(), []);

  const finish = useCallback((t: string) => {
    stopRef.current = null;
    setState('idle');
    cb.current(t.trim());
  }, []);

  const startBrowser = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return finish('');
    const rec = new Ctor();
    let text = '';
    rec.lang = 'ur-PK';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      text = Array.from(e.results).map((r) => r[0]?.transcript ?? '').join(' ');
    };
    rec.onerror = () => undefined;
    rec.onend = () => finish(text);
    stopRef.current = () => rec.stop();
    setState('listening');
    rec.start();
  }, [finish]);

  const startUplift = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return finish('');
    }
    const rec = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      setState('thinking');
      try {
        const form = new FormData();
        form.append('audio', new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
        const res = await fetch('/api/voice/stt', { method: 'POST', body: form });
        const json = res.ok ? ((await res.json()) as { transcript?: string }) : {};
        finish(json.transcript ?? '');
      } catch {
        finish('');
      }
    };
    const timer = setTimeout(() => rec.state === 'recording' && rec.stop(), MAX_MS);
    stopRef.current = () => {
      clearTimeout(timer);
      if (rec.state === 'recording') rec.stop();
    };
    setState('listening');
    rec.start();
  }, [finish]);

  const start = useCallback(async () => {
    if (state !== 'idle') return;
    await schedule(() => playUrl(clipUrl('mic_listening')), 'now');
    if (PROVIDER === 'uplift') await startUplift();
    else startBrowser();
  }, [state, startBrowser, startUplift]);

  const stop = useCallback(() => stopRef.current?.(), []);

  return { state, start, stop };
}
