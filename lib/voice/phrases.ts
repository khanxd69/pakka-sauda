// Pakka Sauda: dynamic Urdu sentences spoken to the farmer (sent to /api/voice/tts). Owner: Workstream C. Pure.
// Function names and argument shapes are a FROZEN contract (B calls them). Wording may change freely.
// Numbers are written as Urdu words by default so the TTS voice reads them correctly.
// If the phone test shows Uplift reads digits well, set NUMBER_STYLE = 'digits'.
// Grammar note: "چاہتے ہیں" (respectful plural) is used for every farmer, including women.
import type { Grade, LoadingPaidBy } from '../types';
import { toUrduWords, urduDate } from './urdu-number';

export const NUMBER_STYLE: 'words' | 'digits' = 'words';
const n = (x: number) => (NUMBER_STYLE === 'words' ? toUrduWords(x) : Math.round(x).toLocaleString('en-IN'));

export const GRADE_UR: Record<Grade, string> = { A: 'اے', B: 'بی', C: 'سی' };
export type ReadyWhen = 'this_week' | 'next_week' | 'two_weeks';
export const READY_UR: Record<ReadyWhen, string> = { this_week: 'اس ہفتے', next_week: 'اگلے ہفتے', two_weeks: 'دو ہفتے میں' };

export function readBackListing(a: { estimateKg: number; ready: ReadyWhen; minPricePerMann: number }): string {
  return (
    `آپ تقریباً ${n(a.estimateKg)} کلو آلو، ${READY_UR[a.ready]}، ` +
    `کم از کم ${n(a.minPricePerMann)} روپے فی من کے حساب سے بیچنا چاہتے ہیں۔ کیا یہ ٹھیک ہے؟`
  );
}

export function explainOffer(a: {
  buyerNameUr: string; // profile.name_ur, e.g. 'عمران'
  verified: boolean;
  perMann: Record<Grade, number | null>;
  loadingPaidBy: LoadingPaidBy;
  offerTotal: number; // from lib/net.ts compareNet(...).offerTotal
  mandiTotal: number; // from lib/net.ts compareNet(...).mandiTotal
}): string {
  const grade = (g: Grade) =>
    a.perMann[g] == null ? `گریڈ ${GRADE_UR[g]} نہیں لیں گے۔` : `گریڈ ${GRADE_UR[g]} پر ${n(a.perMann[g]!)} روپے فی من۔`;
  return [
    `${a.buyerNameUr} صاحب کی بولی${a.verified ? '، تصدیق شدہ خریدار' : ''}۔`,
    grade('A'),
    grade('B'),
    grade('C'),
    a.loadingPaidBy === 'buyer' ? 'لوڈنگ کا خرچہ خریدار دے گا۔' : 'لوڈنگ کا خرچہ آپ دیں گے۔',
    `اندازاً آپ کے ہاتھ میں ${n(a.offerTotal)} روپے آئیں گے۔`,
    `منڈی خود لے جائیں تو خرچے کے بعد تقریباً ${n(a.mandiTotal)} روپے بنتے۔`,
  ].join(' ');
}

export function explainSauda(a: { buyerNameUr: string; collectionDate: string; tokenAmount: number }): string {
  return (
    `سودا پکا ہو گیا۔ ${a.buyerNameUr} صاحب ${urduDate(a.collectionDate)} کو فصل اٹھائیں گے۔ ` +
    `ٹوکن کی رقم ${n(a.tokenAmount)} روپے ہے۔`
  );
}

export function explainCollection(
  a:
    | { kind: 'payable'; buyerNameUr: string; weighedKg: number; grade: Grade; finalAmount: number; tokenAmount: number; balance: number }
    | { kind: 'grade_not_accepted'; buyerNameUr: string; weighedKg: number; grade: Grade },
): string {
  const head = `${a.buyerNameUr} صاحب نے ${n(a.weighedKg)} کلو، گریڈ ${GRADE_UR[a.grade]} لکھا ہے۔`;
  if (a.kind === 'grade_not_accepted') {
    return `${head} اس گریڈ کا انہوں نے ریٹ نہیں دیا تھا، اس لیے وہ یہ فصل نہیں لیں گے اور ٹوکن انہیں واپس ہوگا۔ اگر گریڈ غلط ہے تو لال بٹن دبائیں۔`;
  }
  return (
    `${head} آپ کو کل ${n(a.finalAmount)} روپے ملیں گے۔ ` +
    `${n(a.tokenAmount)} روپے ٹوکن مل چکا ہے، باقی ${n(Math.max(a.balance, 0))} روپے۔`
  );
}

export function askBalance(balance: number): string {
  return `کیا آپ کو باقی ${n(balance)} روپے مل گئے؟`;
}

/** F5 read-back of the farmer's own quality description and the grade it SUGGESTS (he confirms or changes it). */
export function readBackQuality(a: { grade: Grade; description: string }): string {
  return `آپ نے بتایا: ${a.description}۔ اس حساب سے آپ کے آلو گریڈ ${GRADE_UR[a.grade]} لگتے ہیں۔ کیا یہ ٹھیک ہے؟`;
}
