// Pakka Sauda: tests for the pure core. Run with `npm test`. Owner: Workstream A.
import { describe, expect, it } from 'vitest';
import { bidPreview, settle, tokenAmount } from './settle';
import { compareNet, mandiNetPerKg } from './net';
import { assertCancel, assertTransition, statusAfterGrade, tokenDestination } from './sauda-machine';
import { validateBid } from './rules';
import { estimateToRange, perKgToPerMann, perMannToPerKg } from './format';
import { CreateListingSchema, PlaceBidSchema } from './schemas';
import { saudas, bids, listings } from './fixtures';
import type { SaudaTerms } from './types';

const terms: SaudaTerms = {
  price: { A: 45, B: 39, C: null },
  qty_low_kg: 9000,
  qty_high_kg: 11000,
  expected_grade: 'A',
  collection_date: '2026-10-14',
  loading_paid_by: 'buyer',
  fee_percent: 1,
  token_amount: 45000,
};

describe('settle (the worked example from the spec)', () => {
  it('9,200 kg of grade B at Rs 39', () => {
    const r = settle(terms, 9200, 'B');
    expect(r.outcome).toBe('payable');
    if (r.outcome !== 'payable') return;
    expect(r.finalAmount).toBe(358800);
    expect(r.fee).toBe(3588);
    expect(r.balanceAtLoading).toBe(313800);
    expect(r.buyerPays).toBe(362388);
    expect(r.farmerReceives).toBe(358800);
    expect(r.buyerMayCancel).toBe(false);
  });
  it('unpriced grade -> grade_not_accepted, token to buyer', () => {
    const r = settle(terms, 9200, 'C');
    expect(r).toMatchObject({ outcome: 'grade_not_accepted', tokenTo: 'buyer' });
  });
  it('shortfall below 80% of the low estimate lets the buyer cancel', () => {
    expect(settle(terms, 7199, 'A').buyerMayCancel).toBe(true);
    expect(settle(terms, 7200, 'A').buyerMayCancel).toBe(false);
  });
  it('tiny delivery gives a negative balance (farmer refunds)', () => {
    const r = settle(terms, 500, 'A');
    if (r.outcome === 'payable') expect(r.balanceAtLoading).toBe(22500 - 45000);
  });
  it('rejects zero weight', () => expect(() => settle(terms, 0, 'A')).toThrow());
  it('token matches accept_bid() in SQL', () => {
    expect(tokenAmount(9000, 11000, 45)).toBe(45000);
    expect(tokenAmount(12000, 14000, 36)).toBe(46800);
  });
  it('seed dispute sauda: 8,000 kg C at 30 = 240,000; reviewer B = 312,000', () => {
    const s = saudas[0];
    const c = settle(s.terms, 8000, 'C');
    const b = settle(s.terms, 8000, 'B');
    expect(c.outcome === 'payable' && c.finalAmount).toBe(240000);
    expect(b.outcome === 'payable' && b.finalAmount).toBe(312000);
  });
});

describe('bidPreview', () => {
  it('values at low/mid/high and token on expected grade', () => {
    const p = bidPreview({ qty_low_kg: 9000, qty_high_kg: 11000, expected_grade: 'A' }, { A: 45, B: 39, C: null });
    expect(p.rows[0]).toMatchObject({ valueAtLow: 405000, valueAtMid: 450000, valueAtHigh: 495000 });
    expect(p.rows[2].valueAtMid).toBeNull();
    expect(p.tokenAmount).toBe(45000);
    expect(p.feeAtExpectedMid).toBe(4500);
  });
});

describe('net comparison', () => {
  it('mandi route subtracts commission, transport and labour', () => {
    expect(mandiNetPerKg(50)).toBe(45.25); // 50 x 0.97 - 2.5 - 0.75
  });
  it('compares totals for a quantity', () => {
    const c = compareNet(50, 45, 'buyer', 10000);
    expect(c.offerTotal).toBe(450000);
    expect(c.mandiTotal).toBe(452500);
    expect(c.difference).toBe(-2500);
    expect(compareNet(50, 45, 'farmer', 10000).offerNetPerKg).toBe(44.25);
  });
});

describe('state machine', () => {
  it('allows the happy path with the right roles', () => {
    expect(() => assertTransition('payToken', 'token_due', 'wholesaler')).not.toThrow();
    expect(() => assertTransition('recordCollection', 'awaiting_collection', 'wholesaler')).not.toThrow();
    expect(() => assertTransition('farmerConfirm', 'collected', 'farmer')).not.toThrow();
    expect(() => assertTransition('confirmBalanceReceived', 'agreed', 'farmer')).not.toThrow();
  });
  it('blocks skipped steps and wrong roles', () => {
    expect(() => assertTransition('farmerConfirm', 'awaiting_collection', 'farmer')).toThrow(/BAD_TRANSITION/);
    expect(() => assertTransition('resolveDispute', 'disputed', 'wholesaler')).toThrow(/ROLE_NOT_ALLOWED/);
    expect(() => assertTransition('confirmBalanceReceived', 'collected', 'farmer')).toThrow();
  });
  it('cancel rules and token destination', () => {
    expect(() => assertCancel('buyer_walked_away', 'awaiting_collection', 'wholesaler')).not.toThrow();
    expect(() => assertCancel('shortfall', 'awaiting_collection', 'wholesaler')).toThrow();
    expect(tokenDestination('buyer_walked_away', true)).toBe('farmer');
    expect(tokenDestination('grade_not_accepted', true)).toBe('buyer');
    expect(tokenDestination('token_expired', false)).toBeNull();
  });
  it('status after a grade is agreed or ruled', () => {
    expect(statusAfterGrade(terms, 9000, 'B')).toBe('agreed');
    expect(statusAfterGrade(terms, 9000, 'C')).toBe('cancelled');
  });
});

describe('bid rules', () => {
  const listing = { status: 'open' as const, expected_grade: 'A' as const, min_price_per_kg: 38, ready_from: '2026-10-12' };
  const ok = { priceA: 45, priceB: 39, priceC: null, collectionDate: '2026-10-14' };
  it('accepts a sensible bid', () => expect(validateBid(listing, ok)).toBeNull());
  it('rejects below minimum', () => expect(validateBid(listing, { ...ok, priceA: 37 })).toBe('BELOW_MINIMUM'));
  it('rejects a rising ladder', () => expect(validateBid(listing, { ...ok, priceB: 46 })).toBe('LADDER_NOT_DESCENDING'));
  it('rejects C above A when B is null', () =>
    expect(validateBid(listing, { ...ok, priceB: null, priceC: 50 })).toBe('LADDER_NOT_DESCENDING'));
  it('rejects early collection', () =>
    expect(validateBid(listing, { ...ok, collectionDate: '2026-10-10' })).toBe('COLLECTION_BEFORE_READY'));
  it('requires the expected grade to be priced', () =>
    expect(validateBid({ ...listing, expected_grade: 'B' }, { ...ok, priceB: null })).toBe('EXPECTED_GRADE_NOT_PRICED'));
  it('rejects bids on closed listings', () =>
    expect(validateBid({ ...listing, status: 'sold' }, ok)).toBe('LISTING_NOT_OPEN'));
});

describe('format and schemas', () => {
  it('mann conversions', () => {
    expect(perKgToPerMann(45)).toBe(1800);
    expect(perMannToPerKg(1520)).toBe(38);
    expect(estimateToRange(10000)).toEqual({ low: 9000, high: 11000 });
  });
  it('schemas accept the fixed demo UUIDs and reject bad ranges', () => {
    expect(
      PlaceBidSchema.safeParse({
        listingId: listings[1].id, priceA: 45, priceB: 39, priceC: null, collectionDate: '2026-10-14', loadingPaidBy: 'buyer',
      }).success,
    ).toBe(true);
    expect(
      CreateListingSchema.safeParse({
        qtyLowKg: 11000, qtyHighKg: 9000, expectedGrade: 'A', minPricePerKg: 38, readyFrom: '2026-10-12', readyTo: '2026-10-18',
      }).success,
    ).toBe(false);
  });
  it('fixtures agree with each other', () => {
    expect(bids.every((b) => b.listing.id === b.listing_id)).toBe(true);
    expect(saudas[1].final_amount).toBe(5200 * 44);
  });
});
