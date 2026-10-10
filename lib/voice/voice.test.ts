// Pakka Sauda: tests for the Urdu number reader and writer. Run with `npm test`. Owner: Workstream C.
import { describe, expect, it } from 'vitest';
import { detectUnit, parseUrduNumber } from './parse-number';
import { toUrduWords, urduDate } from './urdu-number';
import { explainCollection, explainOffer, readBackListing } from './phrases';
import { CLIPS } from './clips';

describe('parseUrduNumber', () => {
  const cases: Array<[string, number | null]> = [
    ['دس ہزار کلو', 10000],
    ['10,000 کلو آلو', 10000],
    ['۱۰۰۰۰', 10000],
    ['تقریباً پندرہ ہزار کلو ہوں گے', 15000],
    ['ڈیڑھ ہزار من', 1500],
    ['ساڑھے تین ہزار', 3500],
    ['پونے دو ہزار', 1750],
    ['سوا دو سو', 225],
    ['اٹھارہ سو روپے', 1800],
    ['ایک ہزار آٹھ سو', 1800],
    ['ایک من کا ریٹ اٹھارہ سو', 1800],
    ['فی من پندرہ سو بیس روپے', 1520],
    ['تین لاکھ اٹھاون ہزار آٹھ سو', 358800],
    ['10 hazar kilo', 10000],
    ['ڈھائی لاکھ', 250000],
    ['45.5', 45.5],
    ['مجھے نہیں پتا', null],
    ['', null],
  ];
  for (const [text, expected] of cases) it(`"${text}" -> ${expected}`, () => expect(parseUrduNumber(text)).toBe(expected));
});

describe('detectUnit', () => {
  it('finds mann and kg, ignores منڈی', () => {
    expect(detectUnit('دس ہزار کلو')).toBe('kg');
    expect(detectUnit('دو سو من')).toBe('mann');
    expect(detectUnit('منڈی کا ریٹ')).toBeNull();
  });
});

describe('toUrduWords', () => {
  it('reads South Asian grouping', () => {
    expect(toUrduWords(45)).toBe('پینتالیس');
    expect(toUrduWords(10000)).toBe('دس ہزار');
    expect(toUrduWords(1800)).toBe('ایک ہزار آٹھ سو');
    expect(toUrduWords(358800)).toBe('تین لاکھ اٹھاون ہزار آٹھ سو');
    expect(toUrduWords(12500000)).toBe('ایک کروڑ پچیس لاکھ');
  });
  it('round-trips through the parser', () => {
    for (const n of [7, 99, 150, 1520, 9200, 45000, 313800, 1250000]) expect(parseUrduNumber(toUrduWords(n))).toBe(n);
  });
  it('formats dates', () => expect(urduDate('2026-10-14')).toBe('چودہ اکتوبر'));
});

describe('phrases', () => {
  it('builds sentences without leftover placeholders or digits', () => {
    const s = [
      readBackListing({ estimateKg: 10000, ready: 'next_week', minPricePerMann: 1520 }),
      explainOffer({ buyerNameUr: 'عمران', verified: true, perMann: { A: 1800, B: 1560, C: null }, loadingPaidBy: 'buyer', offerTotal: 450000, mandiTotal: 452500 }),
      explainCollection({ kind: 'payable', buyerNameUr: 'عمران', weighedKg: 9200, grade: 'B', finalAmount: 358800, tokenAmount: 45000, balance: 313800 }),
    ];
    for (const x of s) {
      expect(x).not.toMatch(/[{}]|undefined|null|NaN|\d/);
    }
    expect(s[1]).toContain('گریڈ سی نہیں لیں گے');
  });
  it('has every clip in Urdu and Roman', () => {
    for (const c of Object.values(CLIPS)) expect(c.ur.length > 3 && c.roman.length > 3).toBe(true);
  });
});
