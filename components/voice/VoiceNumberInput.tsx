'use client';
// Pakka Sauda: number entry for farmers: giant digits + number pad + mic. Owner: Workstream C. Props FROZEN.
// The mic transcript goes to /api/voice/extract; the value is converted to the displayed unit and passed to onChange
// with the transcript. The farmer always confirms it on the read-back screen (F7).
import { LoaderCircle, Mic } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clipUrl } from '@/lib/voice/clips';
import { NumberPad, type PadKey } from './NumberPad';
import { playUrl, schedule } from './player';
import { micSupported, useMic } from './useMic';

export interface VoiceNumberInputProps {
  field: 'quantity' | 'price';
  unit: 'kg' | 'mann';
  onUnitChange?: (unit: 'kg' | 'mann') => void; // show the kg/mann toggle only if provided
  value: number | null; // in the displayed unit
  onChange: (value: number | null, transcript?: string) => void;
}

const MAX: Record<VoiceNumberInputProps['field'], number> = { quantity: 9_999_999, price: 99_999 };
const KG_PER_MANN = 40;

/** Spoken value + spoken unit -> value in the displayed unit. Price is per unit, so it converts the other way. */
function toDisplayed(field: VoiceNumberInputProps['field'], value: number, spoken: 'kg' | 'mann' | null, shown: 'kg' | 'mann') {
  if (!spoken || spoken === shown) return value;
  const kgToMann = spoken === 'kg' && shown === 'mann';
  if (field === 'quantity') return kgToMann ? value / KG_PER_MANN : value * KG_PER_MANN;
  return kgToMann ? value * KG_PER_MANN : value / KG_PER_MANN;
}

export function VoiceNumberInput({ field, unit, onUnitChange, value, onChange }: VoiceNumberInputProps) {
  const [canMic, setCanMic] = useState(false);
  useEffect(() => setCanMic(micSupported()), []);

  const [extracting, setExtracting] = useState(false);
  const retry = () => void schedule(() => playUrl(clipUrl('mic_retry')), 'now');

  const mic = useMic(async (transcript) => {
    if (!transcript) return retry();
    setExtracting(true);
    try {
      const res = await fetch('/api/voice/extract', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transcript, field }),
        signal: AbortSignal.timeout(3000),
      });
      const r = (await res.json()) as { value: number | null; unit: 'kg' | 'mann' | null };
      if (!res.ok || r.value == null) return retry();
      const v = Math.round(toDisplayed(field, r.value, r.unit, unit));
      if (v <= 0 || v > MAX[field]) return retry();
      onChange(v, transcript);
    } catch {
      retry();
    } finally {
      setExtracting(false);
    }
  });
  const thinking = mic.state === 'thinking' || extracting;

  const press = (k: PadKey) => {
    if (k === 'clear') return onChange(null);
    const digits = value == null ? '' : String(value);
    const next = k === 'back' ? digits.slice(0, -1) : digits + k;
    if (next === '') return onChange(null);
    const n = Number(next);
    if (n > MAX[field]) return;
    onChange(n);
  };

  const unitWord = unit === 'kg' ? 'کلو' : 'من';

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-baseline justify-center gap-3 rounded-2xl border border-line bg-surface px-4 py-5 shadow-card">
        <span dir="ltr" className="min-w-[1ch] text-6xl font-semibold tabular-nums tracking-tight text-ink">
          {value == null ? <span className="text-line-strong">0</span> : value.toLocaleString('en-IN')}
        </span>
        <span className="text-xl text-ink-muted">{field === 'price' ? `روپے / ${unitWord}` : unitWord}</span>
      </div>

      {onUnitChange ? (
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-subtle p-1">
          {(['mann', 'kg'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUnitChange(u)}
              aria-pressed={unit === u}
              className={`flex h-14 items-center justify-center gap-2 rounded-lg text-xl transition-colors duration-150 ${
                unit === u ? 'bg-surface font-semibold text-brand shadow-card ring-1 ring-brand/20' : 'text-ink-muted'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u === 'kg' ? '/img/kg.svg' : '/img/mann.svg'} alt="" className="size-8" />
              {u === 'kg' ? 'کلو' : 'من'}
            </button>
          ))}
        </div>
      ) : null}

      <NumberPad onKey={press} />

      {canMic ? (
        <button
          type="button"
          onClick={() => (mic.state === 'listening' ? mic.stop() : void mic.start())}
          disabled={thinking}
          aria-label="مائیک / Microphone"
          className={`mx-auto flex size-20 items-center justify-center rounded-full text-white shadow-card transition-colors duration-150 ${
            mic.state === 'listening' ? 'animate-pulse bg-danger' : thinking ? 'bg-line-strong' : 'bg-brand'
          }`}
        >
          {thinking ? <LoaderCircle className="size-8 animate-spin" strokeWidth={1.75} aria-hidden /> : <Mic className="size-8" strokeWidth={1.75} aria-hidden />}
        </button>
      ) : null}
    </div>
  );
}
