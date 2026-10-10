// Pakka Sauda: shared domain types. FROZEN after Phase 0 (contracts-v1).
// Owner: Workstream A. Other workstreams import, never edit. Need a change? Follow the contract-change protocol.
// Units: money in rupees, quantities in kg, prices in rupees PER KG. Dates are ISO strings ('2026-10-14').

export type Role = 'farmer' | 'wholesaler' | 'admin';
export type Grade = 'A' | 'B' | 'C';
export const GRADES: readonly Grade[] = ['A', 'B', 'C'];

export type ListingStatus = 'open' | 'sold' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type SaudaStatus =
  | 'token_due'
  | 'awaiting_collection'
  | 'collected'
  | 'disputed'
  | 'agreed'
  | 'settled'
  | 'cancelled';
export type CancelReason =
  | 'token_expired'
  | 'grade_not_accepted'
  | 'shortfall'
  | 'buyer_walked_away'
  | 'crop_loss'
  | 'farmer_sold_elsewhere'
  | 'dispute_unresolved';
export type LoadingPaidBy = 'buyer' | 'farmer';
export type TokenTo = 'farmer' | 'buyer';

export interface Profile {
  id: string;
  role: Role;
  name: string;
  name_ur: string | null;
  phone: string | null;
  district: string | null;
  business_name: string | null;
  verified: boolean;
}
export type ProfileLite = Pick<Profile, 'id' | 'name' | 'name_ur' | 'business_name' | 'verified' | 'district'>;

export interface ReferencePrice {
  id: number;
  crop: string;
  market: string;
  price_per_kg: number;
  source: string; // 'AMIS Punjab' or 'ILLUSTRATIVE'
  source_price: number | null;
  source_unit: string;
  source_date: string;
}

export interface Listing {
  id: string;
  farmer_id: string;
  crop: string; // always 'potato' in the MVP
  qty_low_kg: number;
  qty_high_kg: number;
  expected_grade: Grade;
  min_price_per_kg: number;
  ready_from: string;
  ready_to: string;
  district: string;
  village: string | null;
  voice_transcript: string | null;
  status: ListingStatus;
  created_at: string;
}

export interface Bid {
  id: string;
  listing_id: string;
  wholesaler_id: string;
  price_a: number;
  price_b: number | null; // null = grade not accepted
  price_c: number | null;
  collection_date: string;
  loading_paid_by: LoadingPaidBy;
  note: string | null;
  status: BidStatus;
  created_at: string;
}

/** Frozen copy of the deal terms, written once by accept_bid() and never changed. */
export interface SaudaTerms {
  price: Record<Grade, number | null>;
  qty_low_kg: number;
  qty_high_kg: number;
  expected_grade: Grade;
  collection_date: string;
  loading_paid_by: LoadingPaidBy;
  fee_percent: number;
  token_amount: number;
}

export interface Sauda {
  id: string;
  listing_id: string;
  bid_id: string;
  farmer_id: string;
  wholesaler_id: string;
  terms: SaudaTerms;
  status: SaudaStatus;
  token_due_by: string;
  token_paid_at: string | null;
  collection_code: string | null;
  weighed_kg: number | null;
  delivered_grade: Grade | null;
  buyer_note: string | null;
  farmer_claimed_grade: Grade | null;
  dispute_reason: string | null;
  resolved_grade: Grade | null;
  resolution_note: string | null;
  final_amount: number | null;
  platform_fee: number | null;
  cancel_reason: CancelReason | null;
  token_to: TokenTo | null;
  created_at: string;
  agreed_at: string | null;
  settled_at: string | null;
  cancelled_at: string | null;
}

export type SaudaEventType =
  | 'created'
  | 'token_paid'
  | 'collected'
  | 'confirmed'
  | 'disputed'
  | 'resolved'
  | 'balance_received'
  | 'cancelled';

export interface SaudaEvent {
  id: number;
  sauda_id: string;
  actor_id: string | null;
  type: SaudaEventType;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface Evidence {
  id: string;
  sauda_id: string;
  uploaded_by: string;
  kind: 'collection' | 'dispute';
  url: string;
  lat: number | null;
  lng: number | null;
  captured_at: string;
}

// ---- View models returned by lib/queries.ts (joins already done) ----

export interface ListingView extends Listing {
  farmer: ProfileLite;
  bid_count: number;
}

export interface BidView extends Bid {
  buyer: ProfileLite;
  listing: Listing;
}

export interface SaudaView extends Sauda {
  farmer: ProfileLite;
  buyer: ProfileLite;
  listing: Listing;
}

export interface AdminStats {
  settled_value: number; // sum of final_amount over settled saudas
  fee_revenue: number; // sum of platform_fee over settled saudas
  active_listings: number;
  by_status: Record<SaudaStatus, number>;
  open_disputes: number;
  farmers: number;
  wholesalers: number;
}

// ---- Server action results ----

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };
