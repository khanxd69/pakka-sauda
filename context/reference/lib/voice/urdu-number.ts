// Pakka Sauda: Urdu number words. Owner: Workstream C. Pure.
// Used two ways:
//   toUrduWords(358800) -> "تین لاکھ اٹھاون ہزار آٹھ سو"  (so TTS never has to guess how to read digits)
//   URDU_WORD_VALUES     -> lookup used by parse-number.ts to read speech-to-text output
// Have a native speaker check the 0-99 list before the demo; spellings vary slightly by region.

export const URDU_0_99 = [
  'صفر', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو',
  'دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس',
  'بیس', 'اکیس', 'بائیس', 'تئیس', 'چوبیس', 'پچیس', 'چھبیس', 'ستائیس', 'اٹھائیس', 'انتیس',
  'تیس', 'اکتیس', 'بتیس', 'تینتیس', 'چونتیس', 'پینتیس', 'چھتیس', 'سینتیس', 'اڑتیس', 'انتالیس',
  'چالیس', 'اکتالیس', 'بیالیس', 'تینتالیس', 'چوالیس', 'پینتالیس', 'چھیالیس', 'سینتالیس', 'اڑتالیس', 'انچاس',
  'پچاس', 'اکاون', 'باون', 'ترپن', 'چون', 'پچپن', 'چھپن', 'ستاون', 'اٹھاون', 'انسٹھ',
  'ساٹھ', 'اکسٹھ', 'باسٹھ', 'تریسٹھ', 'چونسٹھ', 'پینسٹھ', 'چھیاسٹھ', 'سڑسٹھ', 'اڑسٹھ', 'انہتر',
  'ستر', 'اکہتر', 'بہتر', 'تہتر', 'چوہتر', 'پچھتر', 'چھہتر', 'ستتر', 'اٹھہتر', 'اناسی',
  'اسی', 'اکیاسی', 'بیاسی', 'تراسی', 'چوراسی', 'پچاسی', 'چھیاسی', 'ستاسی', 'اٹھاسی', 'نواسی',
  'نوے', 'اکانوے', 'بانوے', 'ترانوے', 'چورانوے', 'پچانوے', 'چھیانوے', 'ستانوے', 'اٹھانوے', 'ننانوے',
] as const;

/** Common alternative spellings that speech-to-text may return. */
const ALTERNATES: Record<string, number> = { 'چھے': 6, 'چھ': 6, 'اک': 1, 'سولا': 16, 'اسّی': 80, 'نوّے': 90 };

export const URDU_WORD_VALUES: Record<string, number> = {
  ...Object.fromEntries(URDU_0_99.map((w, i) => [w, i])),
  ...ALTERNATES,
};

export const URDU_MULTIPLIERS: Record<string, number> = { 'سو': 100, 'ہزار': 1_000, 'لاکھ': 100_000, 'کروڑ': 10_000_000 };

/** Whole rupees / kg only. Uses the South Asian system: crore, lakh, hazar, sau. */
export function toUrduWords(n: number): string {
  let x = Math.round(Math.abs(n));
  if (x < 100) return URDU_0_99[x];
  const parts: string[] = [];
  const take = (unit: number, word: string) => {
    const q = Math.floor(x / unit);
    if (q > 0) {
      parts.push(`${toUrduWords(q)} ${word}`);
      x -= q * unit;
    }
  };
  take(10_000_000, 'کروڑ');
  take(100_000, 'لاکھ');
  take(1_000, 'ہزار');
  take(100, 'سو');
  if (x > 0) parts.push(URDU_0_99[x]);
  return parts.join(' ');
}

const URDU_MONTHS = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];

/** '2026-10-14' -> "چودہ اکتوبر" */
export function urduDate(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${toUrduWords(d)} ${URDU_MONTHS[m - 1]}`;
}
