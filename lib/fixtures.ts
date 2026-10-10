// Pakka Sauda: typed demo data that mirrors supabase/seed.sql (same IDs, same numbers).
// Used by the Phase 0 stubs in lib/queries.ts so UI work can start before the database is wired.
// Also handy in tests. Owner: Workstream A. If seed.sql changes, update this file in the same commit.
import type {
  AdminStats,
  BidView,
  Listing,
  ListingView,
  Profile,
  ProfileLite,
  ReferencePrice,
  SaudaView,
} from './types';
import { DEMO_IDS as ID } from './config';

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const ago = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();

export const profiles: Profile[] = [
  { id: ID.rashid, role: 'farmer', name: 'Rashid', name_ur: 'راشد', phone: '0300-0000101', district: 'Okara', business_name: null, verified: true },
  { id: ID.naseem, role: 'farmer', name: 'Naseem Bibi', name_ur: 'نسیم بی بی', phone: '0300-0000102', district: 'Okara', business_name: null, verified: true },
  { id: ID.akram, role: 'farmer', name: 'Akram', name_ur: 'اکرم', phone: '0300-0000103', district: 'Okara', business_name: null, verified: true },
  { id: ID.imran, role: 'wholesaler', name: 'Imran', name_ur: 'عمران', phone: '0300-0000201', district: 'Lahore', business_name: 'Imran Traders', verified: true },
  { id: ID.lahoreFresh, role: 'wholesaler', name: 'Bilal', name_ur: 'بلال', phone: '0300-0000202', district: 'Lahore', business_name: 'Lahore Fresh', verified: true },
  { id: ID.pakAgro, role: 'wholesaler', name: 'Kashif', name_ur: 'کاشف', phone: '0300-0000203', district: 'Lahore', business_name: 'Pak Agro Buyers', verified: false },
  { id: ID.reviewer, role: 'admin', name: 'Reviewer', name_ur: 'جائزہ کار', phone: null, district: null, business_name: null, verified: true },
];

export const lite = (id: string): ProfileLite => {
  const p = profiles.find((x) => x.id === id)!;
  return { id: p.id, name: p.name, name_ur: p.name_ur, business_name: p.business_name, verified: p.verified, district: p.district };
};

export const referencePrices: ReferencePrice[] = [
  { id: 1, crop: 'potato', market: 'Lahore', price_per_kg: 50, source: 'ILLUSTRATIVE', source_price: null, source_unit: 'REPLACE: unit as published', source_date: day(0) },
  { id: 2, crop: 'potato', market: 'Okara', price_per_kg: 46, source: 'ILLUSTRATIVE', source_price: null, source_unit: 'REPLACE: unit as published', source_date: day(0) },
];

const L = (x: Omit<Listing, 'crop' | 'village' | 'voice_transcript'>): Listing => ({ crop: 'potato', village: null, voice_transcript: null, ...x });

export const listingsRaw: Listing[] = [
  L({ id: '00000000-0000-4000-8000-000000001001', farmer_id: ID.rashid, qty_low_kg: 8000, qty_high_kg: 9000, expected_grade: 'A', min_price_per_kg: 38, ready_from: day(-6), ready_to: day(-1), district: 'Okara', status: 'sold', created_at: ago(192) }),
  L({ id: '00000000-0000-4000-8000-000000001002', farmer_id: ID.naseem, qty_low_kg: 6000, qty_high_kg: 7000, expected_grade: 'A', min_price_per_kg: 36, ready_from: day(3), ready_to: day(7), district: 'Okara', status: 'open', created_at: ago(24) }),
  L({ id: '00000000-0000-4000-8000-000000001003', farmer_id: ID.naseem, qty_low_kg: 5000, qty_high_kg: 5500, expected_grade: 'A', min_price_per_kg: 37, ready_from: day(-12), ready_to: day(-8), district: 'Okara', status: 'sold', created_at: ago(336) }),
  L({ id: '00000000-0000-4000-8000-000000001004', farmer_id: ID.akram, qty_low_kg: 12000, qty_high_kg: 14000, expected_grade: 'B', min_price_per_kg: 33, ready_from: day(7), ready_to: day(14), district: 'Okara', status: 'open', created_at: ago(2) }),
];

const bidCount: Record<string, number> = {
  '00000000-0000-4000-8000-000000001001': 2,
  '00000000-0000-4000-8000-000000001002': 1,
  '00000000-0000-4000-8000-000000001003': 1,
  '00000000-0000-4000-8000-000000001004': 1,
};

export const listings: ListingView[] = listingsRaw.map((l) => ({ ...l, farmer: lite(l.farmer_id), bid_count: bidCount[l.id] ?? 0 }));
const listingById = (id: string) => listingsRaw.find((l) => l.id === id)!;

export const bids: BidView[] = [
  { id: '00000000-0000-4000-8000-000000002001', listing_id: '00000000-0000-4000-8000-000000001001', wholesaler_id: ID.imran, price_a: 45, price_b: 39, price_c: 30, collection_date: day(-1), loading_paid_by: 'buyer', note: null, status: 'accepted', created_at: ago(168) },
  { id: '00000000-0000-4000-8000-000000002002', listing_id: '00000000-0000-4000-8000-000000001001', wholesaler_id: ID.lahoreFresh, price_a: 44, price_b: 40, price_c: 32, collection_date: day(-1), loading_paid_by: 'buyer', note: null, status: 'rejected', created_at: ago(168) },
  { id: '00000000-0000-4000-8000-000000002003', listing_id: '00000000-0000-4000-8000-000000001002', wholesaler_id: ID.lahoreFresh, price_a: 42, price_b: 37, price_c: null, collection_date: day(5), loading_paid_by: 'buyer', note: 'Can collect on day 5', status: 'pending', created_at: ago(20) },
  { id: '00000000-0000-4000-8000-000000002004', listing_id: '00000000-0000-4000-8000-000000001003', wholesaler_id: ID.lahoreFresh, price_a: 44, price_b: 38, price_c: null, collection_date: day(-8), loading_paid_by: 'buyer', note: null, status: 'accepted', created_at: ago(312) },
  { id: '00000000-0000-4000-8000-000000002005', listing_id: '00000000-0000-4000-8000-000000001004', wholesaler_id: ID.imran, price_a: 40, price_b: 36, price_c: 28, collection_date: day(10), loading_paid_by: 'farmer', note: null, status: 'pending', created_at: ago(1) },
].map((b) => ({ ...(b as Omit<BidView, 'buyer' | 'listing'>), buyer: lite(b.wholesaler_id), listing: listingById(b.listing_id) }));

const saudaBase = {
  collection_code: null,
  weighed_kg: null,
  delivered_grade: null,
  buyer_note: null,
  farmer_claimed_grade: null,
  dispute_reason: null,
  resolved_grade: null,
  resolution_note: null,
  final_amount: null,
  platform_fee: null,
  cancel_reason: null,
  token_to: null,
  agreed_at: null,
  settled_at: null,
  cancelled_at: null,
} as const;

export const saudas: SaudaView[] = [
  {
    ...saudaBase,
    id: ID.disputeSauda,
    listing_id: '00000000-0000-4000-8000-000000001001',
    bid_id: '00000000-0000-4000-8000-000000002001',
    farmer_id: ID.rashid,
    wholesaler_id: ID.imran,
    terms: { price: { A: 45, B: 39, C: 30 }, qty_low_kg: 8000, qty_high_kg: 9000, expected_grade: 'A', collection_date: day(-1), loading_paid_by: 'buyer', fee_percent: 1, token_amount: 38250 },
    status: 'collected',
    token_due_by: ago(168),
    token_paid_at: ago(168),
    collection_code: '4821',
    weighed_kg: 8000,
    delivered_grade: 'C',
    buyer_note: 'Many small and cut tubers',
    final_amount: 240000,
    platform_fee: 2400,
    created_at: ago(168),
    farmer: lite(ID.rashid),
    buyer: lite(ID.imran),
    listing: listingById('00000000-0000-4000-8000-000000001001'),
  },
  {
    ...saudaBase,
    id: ID.settledSauda,
    listing_id: '00000000-0000-4000-8000-000000001003',
    bid_id: '00000000-0000-4000-8000-000000002004',
    farmer_id: ID.naseem,
    wholesaler_id: ID.lahoreFresh,
    terms: { price: { A: 44, B: 38, C: null }, qty_low_kg: 5000, qty_high_kg: 5500, expected_grade: 'A', collection_date: day(-8), loading_paid_by: 'buyer', fee_percent: 1, token_amount: 23100 },
    status: 'settled',
    token_due_by: ago(312),
    token_paid_at: ago(312),
    collection_code: '1937',
    weighed_kg: 5200,
    delivered_grade: 'A',
    final_amount: 228800,
    platform_fee: 2288,
    created_at: ago(312),
    agreed_at: ago(192),
    settled_at: ago(192),
    farmer: lite(ID.naseem),
    buyer: lite(ID.lahoreFresh),
    listing: listingById('00000000-0000-4000-8000-000000001003'),
  },
];

export const adminStats: AdminStats = {
  settled_value: 228800,
  fee_revenue: 2288,
  active_listings: 2,
  by_status: { token_due: 0, awaiting_collection: 0, collected: 1, disputed: 0, agreed: 0, settled: 1, cancelled: 0 },
  open_disputes: 0,
  farmers: 3,
  wholesalers: 3,
};
