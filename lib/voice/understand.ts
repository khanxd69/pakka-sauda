// Pakka Sauda: deterministic reading of the farmer's own words for the crop and the quality of his produce.
// Owner: Workstream C. Pure, no AI: AGENTS.md rule 7 says AI never decides grades, so the expected grade is
// SUGGESTED from fixed keywords, read back to the farmer, and he confirms or changes it. Unclear speech -> null.
import type { Grade } from '../types';
import { normalise } from './parse-number';

// Each keyword must start a word (suffixes allowed: آلو matches آلوؤں), so short words never match inside others.
const has = (text: string, words: string[]) => words.some((w) => text.includes(` ${w}`));
const joined = (t: string) => ` ${normalise(t).join(' ')} `;

// ---- crop ----
const POTATO = ['آلو', 'الو', 'آلوؤں', 'آلوں', 'aloo', 'alu', 'aaloo', 'aalu', 'potato', 'potatoes'];
const OTHER_CROPS = [
  'گندم', 'گیہوں', 'پیاز', 'ٹماٹر', 'گاجر', 'مکئی', 'چاول', 'دھان', 'کپاس', 'مرچ', 'لہسن', 'کینو',
  'gandum', 'wheat', 'piyaz', 'pyaz', 'onion', 'tamatar', 'tomato', 'gajar', 'carrot', 'makai', 'maize', 'corn', 'chawal', 'rice', 'kapas', 'cotton',
];

/** 'potato' if he named potatoes, 'other' for another crop (not supported yet), null if unclear. */
export function matchCrop(transcript: string): 'potato' | 'other' | null {
  const t = joined(transcript);
  if (has(t, POTATO)) return 'potato';
  if (has(t, OTHER_CROPS)) return 'other';
  return null;
}

// ---- quality ----
export type Size = 'large' | 'medium' | 'small';
export type Marks = 'none' | 'some' | 'many';
export type Firmness = 'firm' | 'soft';

export interface QualityReading {
  grade: Grade | null; // suggestion only; null = not enough to suggest
  size: Size | null;
  marks: Marks | null;
  firmness: Firmness | null;
}

const SIZE: Array<[Size, string[]]> = [
  ['small', ['چھوٹے', 'چھوٹا', 'چھوٹی', 'باریک', 'chote', 'chhote', 'chota', 'small']],
  ['medium', ['درمیانے', 'درمیانہ', 'درمیانی', 'ٹھیک ٹھاک', 'darmiyane', 'darmiyana', 'medium', 'normal']],
  ['large', ['بڑے', 'بڑا', 'بڑی', 'موٹے', 'موٹا', 'bare', 'bara', 'baray', 'barey', 'mote', 'large', 'big']],
];
// Order matters: the clean / negated phrases are checked before the bare word "داغ".
const MARKS_NONE = ['بے داغ', 'بغیر داغ', 'داغ نہیں', 'صاف', 'be daagh', 'bedaagh', 'daagh nahi', 'saaf', 'clean'];
const MARKS_MANY = ['زیادہ داغ', 'بہت داغ', 'داغ زیادہ', 'داغی', 'کٹے', 'کٹا', 'خراب', 'گلے', 'سڑے', 'کیڑا', 'zyada daagh', 'bohat daagh', 'kharab', 'kate', 'sare'];
const MARKS_SOME = ['تھوڑے داغ', 'کچھ داغ', 'کم داغ', 'ہلکے داغ', 'thore daagh', 'kuch daagh', 'kam daagh'];
const MARK_WORDS = ['داغ', 'دھبے', 'daagh', 'dagh', 'spots'];
const SOFT = ['نرم', 'پلپلے', 'ڈھیلے', 'naram', 'narm', 'soft'];
const FIRM = ['سخت', 'مضبوط', 'sakht', 'firm', 'hard'];

function pick<T>(text: string, table: Array<[T, string[]]>): T | null {
  for (const [value, words] of table) if (has(text, words)) return value;
  return null;
}

/** Reads size, marks and firmness from his description and suggests a grade. Pure keywords, no AI. */
export function readQuality(transcript: string): QualityReading {
  const t = joined(transcript);
  const size = pick(t, SIZE);
  const marks: Marks | null = has(t, MARKS_NONE)
    ? 'none'
    : has(t, MARKS_MANY)
      ? 'many'
      : has(t, MARKS_SOME) || has(t, MARK_WORDS)
        ? 'some'
        : null;
  const firmness: Firmness | null = has(t, SOFT) ? 'soft' : has(t, FIRM) ? 'firm' : null;

  let grade: Grade | null = null;
  if (size === 'small' || marks === 'many' || firmness === 'soft') grade = 'C';
  else if (size === 'medium' || marks === 'some') grade = 'B';
  else if (size === 'large' || marks === 'none' || firmness === 'firm') grade = 'A';
  return { grade, size, marks, firmness };
}
