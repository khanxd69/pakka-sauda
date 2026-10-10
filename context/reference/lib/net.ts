// Pakka Sauda: "what reaches your hand" comparison for the farmer offers screen (F8). FROZEN after Phase 0. Owner: A.
// Compares selling at the mandi yourself vs. this farm-gate offer. Illustrative costs come from CONFIG.
// Never claim one route is always better: show both numbers and let the farmer decide.
import { CONFIG } from './config';
import type { LoadingPaidBy } from './types';

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Mandi route: reference price minus arhti commission, transport and labour, per kg. */
export function mandiNetPerKg(referencePricePerKg: number): number {
  return r2(
    referencePricePerKg * (1 - CONFIG.MANDI_COMMISSION_PERCENT / 100) - CONFIG.TRANSPORT_PER_KG_TO_MANDI - CONFIG.LABOUR_PER_KG,
  );
}

/** Farm-gate route: the offer price, minus loading labour only if the farmer pays it. */
export function offerNetPerKg(offerPricePerKg: number, loadingPaidBy: LoadingPaidBy): number {
  return r2(offerPricePerKg - (loadingPaidBy === 'farmer' ? CONFIG.LABOUR_PER_KG : 0));
}

export interface NetComparison {
  mandiNetPerKg: number;
  offerNetPerKg: number;
  mandiTotal: number;
  offerTotal: number;
  difference: number; // offerTotal - mandiTotal (positive = offer leaves more in hand)
}

export function compareNet(
  referencePricePerKg: number,
  offerPricePerKg: number,
  loadingPaidBy: LoadingPaidBy,
  qtyKg: number,
): NetComparison {
  const m = mandiNetPerKg(referencePricePerKg);
  const o = offerNetPerKg(offerPricePerKg, loadingPaidBy);
  const mandiTotal = r2(m * qtyKg);
  const offerTotal = r2(o * qtyKg);
  return { mandiNetPerKg: m, offerNetPerKg: o, mandiTotal, offerTotal, difference: r2(offerTotal - mandiTotal) };
}
