'use client';
// Pakka Sauda: live-camera photo with location (P1). Owner: Workstream C. Props FROZEN (contracts-v1).
// In-page getUserMedia camera only (no gallery picker), JPEG <= 1600 px at quality 0.8, browser geolocation
// (5 s timeout, null if denied). Falls back to a capture="environment" file input, labelled as such.
import { useCallback, useEffect, useRef, useState } from 'react';

export interface CameraCaptureProps {
  onCapture: (file: File, coords: { lat: number; lng: number } | null) => void;
  hint?: string; // e.g. "Include the farmer's code 4821 in the photo"
}

type Coords = { lat: number; lng: number } | null;
const MAX_SIDE = 1600;

function getCoords(): Promise<Coords> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60_000, enableHighAccuracy: true },
    );
  });
}

function toJpeg(source: CanvasImageSource, w: number, h: number): Promise<File | null> {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ? new File([b], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }) : null), 'image/jpeg', 0.8),
  );
}

export function CameraCapture({ onCapture, hint }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<'idle' | 'live' | 'done' | 'fallback'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);
  useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);

  async function open() {
    if (!navigator.mediaDevices?.getUserMedia) return setMode('fallback');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setMode('live');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setMode('fallback');
    }
  }

  async function finish(file: File | null) {
    if (!file) return;
    const coords = await getCoords();
    setPreview(URL.createObjectURL(file));
    setMode('done');
    onCapture(file, coords);
  }

  async function shoot() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    setBusy(true);
    const file = await toJpeg(v, v.videoWidth, v.videoHeight);
    stop();
    await finish(file);
    setBusy(false);
  }

  async function fromInput(f: File | undefined) {
    if (!f) return;
    setBusy(true);
    const img = await createImageBitmap(f).catch(() => null);
    const file = img ? await toJpeg(img, img.width, img.height) : f;
    await finish(file);
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-stone-300 p-3">
      {mode === 'idle' ? (
        <button type="button" onClick={open} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-lg text-white">
          📷 <span>{hint ?? 'Take photo'}</span>
        </button>
      ) : null}

      {mode === 'live' ? (
        <div className="relative overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} playsInline muted className="aspect-[3/4] w-full object-cover" />
          {hint ? <div className="absolute inset-x-0 top-0 bg-black/60 p-2 text-center text-sm text-white">{hint}</div> : null}
          <button
            type="button"
            onClick={shoot}
            disabled={busy}
            aria-label="Shutter"
            className="absolute bottom-3 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-white bg-white/30 active:scale-95"
          />
        </div>
      ) : null}

      {mode === 'fallback' ? (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Fallback camera{hint ? `: ${hint}` : ''}</span>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => void fromInput(e.target.files?.[0])} />
        </label>
      ) : null}

      {mode === 'done' && preview ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Captured" className="h-24 w-24 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              void open();
            }}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            ↺ Retake
          </button>
        </div>
      ) : null}
    </div>
  );
}
