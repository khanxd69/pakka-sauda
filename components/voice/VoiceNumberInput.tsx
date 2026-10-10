'use client';
// Pakka Sauda: number entry for farmers: giant digits + number pad + mic. Owner: Workstream C. Props FROZEN.
// PHASE 0 STUB: a large numeric input only. Step C1.1 builds the number pad; step C1.5 adds the mic.
export interface VoiceNumberInputProps {
  field: 'quantity' | 'price';
  unit: 'kg' | 'mann';
  onUnitChange?: (unit: 'kg' | 'mann') => void; // show the kg/mann toggle only if provided
  value: number | null; // in the displayed unit
  onChange: (value: number | null, transcript?: string) => void;
}

export function VoiceNumberInput({ unit, value, onChange }: VoiceNumberInputProps) {
  return (
    <label className="flex items-baseline justify-center gap-3">
      <input
        inputMode="numeric"
        className="w-56 rounded-xl border-2 p-3 text-center text-5xl"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value.replace(/[^\d.]/g, '')))}
      />
      <span className="text-2xl">{unit === 'kg' ? 'کلو' : 'من'}</span>
    </label>
  );
}
