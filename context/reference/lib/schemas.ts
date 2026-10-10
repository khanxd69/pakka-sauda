// Pakka Sauda: Zod input schemas for every server action. FROZEN after Phase 0. Owner: Workstream A.
// UIs import the inferred input types so the call sites match the actions exactly.
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const grade = z.enum(['A', 'B', 'C']);
const price = z.number().positive().max(10_000); // rupees per kg
const kg = z.number().positive().max(10_000_000);

export const CreateListingSchema = z
  .object({
    qtyLowKg: kg,
    qtyHighKg: kg,
    expectedGrade: grade,
    minPricePerKg: price,
    readyFrom: isoDate,
    readyTo: isoDate,
    voiceTranscript: z.string().max(4000).optional(),
  })
  .refine((v) => v.qtyHighKg >= v.qtyLowKg, { message: 'High estimate is below low estimate', path: ['qtyHighKg'] })
  .refine((v) => v.readyTo >= v.readyFrom, { message: 'Ready-to date is before ready-from', path: ['readyTo'] });
export type CreateListingInput = z.infer<typeof CreateListingSchema>;

export const PlaceBidSchema = z.object({
  listingId: z.string().uuid(),
  priceA: price,
  priceB: price.nullable(),
  priceC: price.nullable(),
  collectionDate: isoDate,
  loadingPaidBy: z.enum(['buyer', 'farmer']),
  note: z.string().max(500).optional(),
});
export type PlaceBidInput = z.infer<typeof PlaceBidSchema>;

export const RecordCollectionSchema = z.object({
  saudaId: z.string().uuid(),
  weighedKg: kg,
  grade,
  note: z.string().max(1000).optional(),
});
export type RecordCollectionInput = z.infer<typeof RecordCollectionSchema>;

export const FarmerDisputeSchema = z.object({
  saudaId: z.string().uuid(),
  claimedGrade: grade,
  reason: z.string().max(1000).optional(),
});
export type FarmerDisputeInput = z.infer<typeof FarmerDisputeSchema>;

export const ResolveDisputeSchema = z.object({
  saudaId: z.string().uuid(),
  grade,
  note: z.string().min(1).max(1000),
});
export type ResolveDisputeInput = z.infer<typeof ResolveDisputeSchema>;

export const CancelSaudaSchema = z.object({
  saudaId: z.string().uuid(),
  reason: z.enum([
    'token_expired',
    'grade_not_accepted',
    'shortfall',
    'buyer_walked_away',
    'crop_loss',
    'farmer_sold_elsewhere',
    'dispute_unresolved',
  ]),
});
export type CancelSaudaInput = z.infer<typeof CancelSaudaSchema>;

export const IdSchema = z.string().uuid();
