// Pakka Sauda: THE money function. FROZEN after Phase 0. Owner: Workstream A.
// Every rupee amount shown or stored comes from here. Pure: no I/O, safe on server and client (for previews).
import type { Grade, SaudaTerms } from './types';
import { CONFIG } from './config';

const r2 = (n: number) => Math.round(n * 100) / 100;

export type SettleResult =
  | {
      outcome: 'payable';
      grade: Grade;
      weighedKg: number;
      pricePerKg: number;
      finalAmount: number; // what the farmer receives in total
      fee: number; // platform fee, paid by the buyer on top
      tokenAmount: number; // already paid
      balanceAtLoading: number; // finalAmount - token; negative = farmer refunds the difference
      farmerReceives: number;
      buyerPays: number; // finalAmount + fee
      buyerMayCancel: boolean; // weight below SHORTFALL_RATIO x low estimate
    }
  | {
      outcome: 'grade_not_accepted'; // buyer never priced this grade: he may walk away, token returned to him
      grade: Grade;
      weighedKg: number;
      tokenTo: 'buyer';
      buyerMayCancel: boolean;
    };

export function isShortfall(terms: Pick<SaudaTerms, 'qty_low_kg'>, weighedKg: number): boolean {
  return weighedKg < CONFIG.SHORTFALL_RATIO * terms.qty_low_kg;
}

export function settle(terms: SaudaTerms, weighedKg: number, grade: Grade): SettleResult {
  if (!(weighedKg > 0)) throw new Error('WEIGHT_MUST_BE_POSITIVE');
  const buyerMayCancel = isShortfall(terms, weighedKg);
  const price = terms.price[grade];
  if (price == null) return { outcome: 'grade_not_accepted', grade, weighedKg, tokenTo: 'buyer', buyerMayCancel };
  const finalAmount = r2(weighedKg * price);
  const fee = r2((finalAmount * terms.fee_percent) / 100);
  return {
    outcome: 'payable',
    grade,
    weighedKg,
    pricePerKg: price,
    finalAmount,
    fee,
    tokenAmount: terms.token_amount,
    balanceAtLoading: r2(finalAmount - terms.token_amount),
    farmerReceives: finalAmount,
    buyerPays: r2(finalAmount + fee),
    buyerMayCancel,
  };
}

/** Mirrors accept_bid() in schema.sql. Keep the two in step. */
export function tokenAmount(qtyLowKg: number, qtyHighKg: number, pricePerKg: number, tokenPercent: number = CONFIG.TOKEN_PERCENT) {
  return r2((((qtyLowKg + qtyHighKg) / 2) * pricePerKg * tokenPercent) / 100);
}

/** Price the token is based on: the expected grade's price, or grade A if that grade was not priced. */
export function tokenBasePrice(prices: Record<Grade, number | null>, expectedGrade: Grade): number {
  return prices[expectedGrade] ?? (prices.A as number);
}

export interface BidPreviewRow {
  grade: Grade;
  pricePerKg: number | null;
  valueAtLow: number | null;
  valueAtMid: number | null;
  valueAtHigh: number | null;
}
export interface BidPreview {
  rows: BidPreviewRow[];
  tokenAmount: number;
  feeAtExpectedMid: number;
  buyerPaysAtExpectedMid: number;
}

/** Live preview for the bid form: value of the deal at low / mid / high quantity for each grade. */
export function bidPreview(
  listing: { qty_low_kg: number; qty_high_kg: number; expected_grade: Grade },
  prices: Record<Grade, number | null>,
  feePercent: number = CONFIG.FEE_PERCENT,
): BidPreview {
  const mid = (listing.qty_low_kg + listing.qty_high_kg) / 2;
  const rows = (['A', 'B', 'C'] as const).map((grade) => {
    const p = prices[grade];
    return {
      grade,
      pricePerKg: p,
      valueAtLow: p == null ? null : r2(listing.qty_low_kg * p),
      valueAtMid: p == null ? null : r2(mid * p),
      valueAtHigh: p == null ? null : r2(listing.qty_high_kg * p),
    };
  });
  const base = prices.A == null ? 0 : tokenBasePrice(prices, listing.expected_grade);
  const expectedMid = r2(mid * base);
  const fee = r2((expectedMid * feePercent) / 100);
  return {
    rows,
    tokenAmount: tokenAmount(listing.qty_low_kg, listing.qty_high_kg, base),
    feeAtExpectedMid: fee,
    buyerPaysAtExpectedMid: r2(expectedMid + fee),
  };
}
