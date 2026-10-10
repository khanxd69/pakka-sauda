// Pakka Sauda: deterministic number reader for speech-to-text output. Owner: Workstream C. Pure.
// Handles: Western and Urdu digits ("10,000", "۱۰۰۰۰"), Urdu number words ("دس ہزار", "تین لاکھ اٹھاون ہزار آٹھ سو"),
// fractions ("ڈیڑھ ہزار" 1500, "ساڑھے تین ہزار" 3500, "سوا" +1/4, "پونے" -1/4) and Roman multipliers ("10 hazar").
// Reads the FIRST number in the text only (each screen asks one question). Returns null if none found.
// The LLM fallback in extract.ts handles anything this misses. Nothing is saved until the farmer confirms the read-back.
import { URDU_MULTIPLIERS, URDU_WORD_VALUES } from './urdu-number';

const DIACRITICS = /[ً-ٰٟ]/g;
const toAsciiDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

const FIXED_FRACTIONS: Record<string, number> = { 'ڈیڑھ': 1.5, 'ڈھائی': 2.5, 'adha': 0.5, 'آدھا': 0.5 };
const PREFIX_ADJUST: Record<string, number> = { 'ساڑھے': 0.5, 'سوا': 0.25, 'پونے': -0.25 };
const ROMAN_MULTIPLIERS: Record<string, number> = { sau: 100, hazar: 1_000, hazaar: 1_000, lakh: 100_000, lac: 100_000, crore: 10_000_000, karor: 10_000_000 };

export function normalise(text: string): string[] {
  return toAsciiDigits(text.replace(DIACRITICS, ''))
    .replace(/(\d)[,٬](?=\d{2,3}\b)/g, '$1') // 10,000 / 1,00,000 -> digits
    .replace(/[،۔,.!?؟:;()"']/g, (m) => (m === '.' ? '.' : ' '))
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

// "ایک من کا ریٹ اٹھارہ سو" means 1,800 per mann, not 1: drop "ek/fi mann", "per kilo" before reading numbers.
const RATE_UNIT_PHRASE = /(^|\s)(ایک|فی|ek|fi|per)\s+(من|mann|maund|کلو|kilo|kg)(?=\s|$)/g;

export function parseUrduNumber(text: string): number | null {
  const tokens = normalise(normalise(text).join(' ').replace(RATE_UNIT_PHRASE, ' '));
  let total = 0;
  let current = 0;
  let adjust = 0;
  let started = false;

  for (const raw of tokens) {
    const t = raw.replace(/\.$/, '');
    const isDigits = /^\d+(\.\d+)?$/.test(t);
    const word = URDU_WORD_VALUES[t];
    const mult = URDU_MULTIPLIERS[t] ?? ROMAN_MULTIPLIERS[t];

    if (isDigits || word !== undefined || FIXED_FRACTIONS[t] !== undefined) {
      const v = isDigits ? Number(t) : (word ?? FIXED_FRACTIONS[t]);
      current += v + adjust;
      adjust = 0;
      started = true;
    } else if (PREFIX_ADJUST[t] !== undefined && !started) {
      adjust = PREFIX_ADJUST[t];
    } else if (mult !== undefined) {
      if (mult === 100) current = (current || 1) * 100;
      else {
        total += (current || 1) * mult;
        current = 0;
      }
      started = true;
    } else if (started) {
      break; // first non-number word after a number ends it
    }
  }
  if (!started) return null;
  const value = total + current;
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

export type SpokenUnit = 'kg' | 'mann' | null;

/** Detects the unit the speaker used, if any. Token match only ("منڈی" is not "من"). */
export function detectUnit(text: string): SpokenUnit {
  const tokens = normalise(text);
  if (tokens.some((t) => ['من', 'mann', 'man', 'maund', 'munn'].includes(t))) return 'mann';
  if (tokens.some((t) => ['کلو', 'کلوگرام', 'kilo', 'kg', 'kilogram'].includes(t))) return 'kg';
  return null;
}
