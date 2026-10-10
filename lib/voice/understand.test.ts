// Pakka Sauda: tests for lib/voice/understand.ts (crop and quality from the farmer's own words).
import { describe, expect, it } from 'vitest';
import { matchCrop, readQuality } from './understand';

describe('matchCrop', () => {
  it.each([
    ['آلو', 'potato'],
    ['میں آلو بیچنا چاہتا ہوں', 'potato'],
    ['aloo bechne hain', 'potato'],
    ['گندم', 'other'],
    ['pyaz', 'other'],
    ['جی ہاں', null],
    ['آمدنی اچھی ہے', null],
  ])('%s -> %s', (t, want) => expect(matchCrop(t)).toBe(want));
});

describe('readQuality', () => {
  it.each([
    ['آلو بڑے ہیں، سخت ہیں اور کوئی داغ نہیں', 'A'],
    ['بڑے اور صاف آلو', 'A'],
    ['bare aur saaf hain', 'A'],
    ['درمیانے ہیں', 'B'],
    ['بڑے ہیں لیکن تھوڑے داغ ہیں', 'B'],
    ['کچھ داغ ہیں', 'B'],
    ['چھوٹے آلو ہیں', 'C'],
    ['بڑے ہیں مگر زیادہ داغ ہیں', 'C'],
    ['کچھ آلو کٹے ہوئے ہیں', 'C'],
    ['نرم ہو گئے ہیں', 'C'],
    ['کوئی داغ ہے', 'B'],
  ])('%s -> %s', (t, want) => expect(readQuality(t).grade).toBe(want));

  it('returns no suggestion when nothing is understood', () => {
    expect(readQuality('پتہ نہیں').grade).toBeNull();
  });

  it('reports what it heard', () => {
    expect(readQuality('بڑے سخت آلو، کوئی داغ نہیں')).toEqual({ grade: 'A', size: 'large', marks: 'none', firmness: 'firm' });
  });
});
