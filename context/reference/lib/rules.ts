// Pakka Sauda: validation rules that need more than a schema. FROZEN after Phase 0. Owner: Workstream A.
// Pure. Server actions call these after Zod parsing; UIs may call them to show errors early.
import type { Grade, Listing } from './types';

export type BidRuleError =
  | 'LISTING_NOT_OPEN'
  | 'EXPECTED_GRADE_NOT_PRICED'
  | 'BELOW_MINIMUM'
  | 'LADDER_NOT_DESCENDING'
  | 'COLLECTION_BEFORE_READY';

export const BID_ERROR_TEXT: Record<BidRuleError, string> = {
  LISTING_NOT_OPEN: 'This listing is no longer open.',
  EXPECTED_GRADE_NOT_PRICED: "You must price the farmer's expected grade.",
  BELOW_MINIMUM: "Your price for the farmer's expected grade is below his minimum.",
  LADDER_NOT_DESCENDING: 'Grade B cannot pay more than A, and C cannot pay more than B.',
  COLLECTION_BEFORE_READY: 'Collection date is before the crop is ready.',
};

export function validateBid(
  listing: Pick<Listing, 'status' | 'expected_grade' | 'min_price_per_kg' | 'ready_from'>,
  bid: { priceA: number; priceB: number | null; priceC: number | null; collectionDate: string },
): BidRuleError | null {
  if (listing.status !== 'open') return 'LISTING_NOT_OPEN';
  const prices: Record<Grade, number | null> = { A: bid.priceA, B: bid.priceB, C: bid.priceC };
  const expected = prices[listing.expected_grade];
  if (expected == null) return 'EXPECTED_GRADE_NOT_PRICED';
  if (expected < listing.min_price_per_kg) return 'BELOW_MINIMUM';
  if (bid.priceB != null && bid.priceB > bid.priceA) return 'LADDER_NOT_DESCENDING';
  if (bid.priceC != null && bid.priceC > (bid.priceB ?? bid.priceA)) return 'LADDER_NOT_DESCENDING';
  if (bid.collectionDate < listing.ready_from) return 'COLLECTION_BEFORE_READY';
  return null;
}

/** 4-digit one-time collection code, shown on the farmer's phone and photographed by the buyer (P1). */
export function newCollectionCode(random: () => number = Math.random): string {
  return String(Math.floor(1000 + random() * 9000));
}
