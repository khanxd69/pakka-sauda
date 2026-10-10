'use client';
// Pakka Sauda: live-camera photo with location (P1). Owner: Workstream C. Props FROZEN (contracts-v1).
// PHASE 0 STUB: a plain camera file input. Step C3.1 replaces it with an in-page getUserMedia camera
// (no gallery upload) and attaches browser geolocation.
export interface CameraCaptureProps {
  onCapture: (file: File, coords: { lat: number; lng: number } | null) => void;
  hint?: string; // e.g. "Include the farmer's code 4821 in the photo"
}

export function CameraCapture({ onCapture, hint }: CameraCaptureProps) {
  return (
    <label className="block rounded-xl border-2 border-dashed p-4 text-center">
      <span className="block">{hint ?? 'Take photo'}</span>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="mt-2"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onCapture(f, null);
        }}
      />
    </label>
  );
}
