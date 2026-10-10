// Pakka Sauda: read side. SERVER ONLY. Owner: Workstream A.
// Every function queries Supabase via db(). SIGNATURES ARE FROZEN (contracts-v1): do not change them.
// numeric columns are coerced to numbers here (mapListing / mapBid / mapSauda) so the rest of the app sees numbers.
import 'server-only';
import type {
  AdminStats, Bid, BidView, Evidence, Grade, Listing, ListingView, Profile, ProfileLite, ReferencePrice, Sauda,
  SaudaEvent, SaudaStatus, SaudaTerms, SaudaView,
} from './types';
import { db, toNum, toNumOrNull } from './db';

export interface ListingFilters {
  district?: string;
  grade?: Grade;
  readyBy?: string; // ISO date: listings whose ready_from <= readyBy
}

const LITE = 'id,name,name_ur,business_name,verified,district';
const LISTING_SELECT = `*, farmer:profiles(${LITE})`;
const BID_SELECT = `*, buyer:profiles(${LITE}), listing:listings(*)`;
const SAUDA_SELECT = `*, farmer:profiles!saudas_farmer_id_fkey(${LITE}), buyer:profiles!saudas_wholesaler_id_fkey(${LITE}), listing:listings(*)`;

type Row = Record<string, unknown>;

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(`DB_ERROR:${res.error.message}`);
  return res.data as T;
}

function mapListing(r: Row): Listing {
  return {
    ...(r as unknown as Listing),
    qty_low_kg: toNum(r.qty_low_kg),
    qty_high_kg: toNum(r.qty_high_kg),
    min_price_per_kg: toNum(r.min_price_per_kg),
  };
}

function mapBid(r: Row): Bid {
  return {
    ...(r as unknown as Bid),
    price_a: toNum(r.price_a),
    price_b: toNumOrNull(r.price_b),
    price_c: toNumOrNull(r.price_c),
  };
}

function mapTerms(t: SaudaTerms): SaudaTerms {
  return {
    ...t,
    price: { A: toNumOrNull(t.price.A), B: toNumOrNull(t.price.B), C: toNumOrNull(t.price.C) },
    qty_low_kg: toNum(t.qty_low_kg),
    qty_high_kg: toNum(t.qty_high_kg),
    fee_percent: toNum(t.fee_percent),
    token_amount: toNum(t.token_amount),
  };
}

function mapSauda(r: Row): Sauda {
  return {
    ...(r as unknown as Sauda),
    terms: mapTerms(r.terms as SaudaTerms),
    weighed_kg: toNumOrNull(r.weighed_kg),
    final_amount: toNumOrNull(r.final_amount),
    platform_fee: toNumOrNull(r.platform_fee),
  };
}

const mapBidView = (r: Row): BidView => ({
  ...mapBid(r),
  buyer: r.buyer as ProfileLite,
  listing: mapListing(r.listing as Row),
});

const mapSaudaView = (r: Row): SaudaView => ({
  ...mapSauda(r),
  farmer: r.farmer as ProfileLite,
  buyer: r.buyer as ProfileLite,
  listing: mapListing(r.listing as Row),
});

/** Pending bid count per listing, in one query. */
async function pendingBidCounts(listingIds: string[]): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};
  const rows = check(await db().from('bids').select('listing_id').eq('status', 'pending').in('listing_id', listingIds)) as Row[];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.listing_id as string] = (counts[r.listing_id as string] ?? 0) + 1;
  return counts;
}

async function toListingViews(rows: Row[]): Promise<ListingView[]> {
  const counts = await pendingBidCounts(rows.map((r) => r.id as string));
  return rows.map((r) => ({ ...mapListing(r), farmer: r.farmer as ProfileLite, bid_count: counts[r.id as string] ?? 0 }));
}

const ROLE_ORDER: Record<Profile['role'], number> = { farmer: 0, wholesaler: 1, admin: 2 };

export async function getProfiles(): Promise<Profile[]> {
  const rows = check(await db().from('profiles').select('*').order('id')) as Profile[];
  return rows.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);
}
export async function getProfile(id: string): Promise<Profile | null> {
  return check(await db().from('profiles').select('*').eq('id', id).maybeSingle()) as Profile | null;
}
export async function getWholesalers(): Promise<Profile[]> {
  return check(await db().from('profiles').select('*').eq('role', 'wholesaler').order('id')) as Profile[];
}
export async function getReferencePrices(): Promise<ReferencePrice[]> {
  const rows = check(await db().from('reference_prices').select('*').order('id')) as Row[];
  return rows
    .map((r) => ({ ...(r as unknown as ReferencePrice), price_per_kg: toNum(r.price_per_kg), source_price: toNumOrNull(r.source_price) }))
    .sort((a, b) => (a.market === 'Lahore' ? -1 : b.market === 'Lahore' ? 1 : 0));
}
/** Open listings, newest first. */
export async function getOpenListings(filters: ListingFilters = {}): Promise<ListingView[]> {
  let q = db().from('listings').select(LISTING_SELECT).eq('status', 'open');
  if (filters.district) q = q.eq('district', filters.district);
  if (filters.grade) q = q.eq('expected_grade', filters.grade);
  if (filters.readyBy) q = q.lte('ready_from', filters.readyBy);
  return toListingViews(check(await q.order('created_at', { ascending: false })) as Row[]);
}
export async function getListing(id: string): Promise<ListingView | null> {
  const row = check(await db().from('listings').select(LISTING_SELECT).eq('id', id).maybeSingle()) as Row | null;
  return row ? (await toListingViews([row]))[0] : null;
}
/** All of one farmer's listings (any status), newest first. */
export async function getMyListings(farmerId: string): Promise<ListingView[]> {
  const rows = check(
    await db().from('listings').select(LISTING_SELECT).eq('farmer_id', farmerId).order('created_at', { ascending: false }),
  ) as Row[];
  return toListingViews(rows);
}
/** Pending bids on the farmer's OPEN listings: the F8 offers screen. Highest grade-A price first. */
export async function getOffersForFarmer(farmerId: string): Promise<BidView[]> {
  const rows = check(
    await db()
      .from('bids')
      .select(`*, buyer:profiles(${LITE}), listing:listings!inner(*)`)
      .eq('status', 'pending')
      .eq('listing.farmer_id', farmerId)
      .eq('listing.status', 'open'),
  ) as Row[];
  return rows.map(mapBidView).sort((a, b) => b.price_a - a.price_a);
}
export async function getBidsForListing(listingId: string): Promise<BidView[]> {
  const rows = check(
    await db().from('bids').select(BID_SELECT).eq('listing_id', listingId).order('created_at', { ascending: false }),
  ) as Row[];
  return rows.map(mapBidView);
}
export async function getMyBids(wholesalerId: string): Promise<BidView[]> {
  const rows = check(
    await db().from('bids').select(BID_SELECT).eq('wholesaler_id', wholesalerId).order('created_at', { ascending: false }),
  ) as Row[];
  return rows.map(mapBidView);
}
/** Saudas where the user is the farmer or the buyer (admin: all). Newest first. */
export async function getSaudasForUser(user: Profile): Promise<SaudaView[]> {
  let q = db().from('saudas').select(SAUDA_SELECT);
  if (user.role === 'farmer') q = q.eq('farmer_id', user.id);
  if (user.role === 'wholesaler') q = q.eq('wholesaler_id', user.id);
  return (check(await q.order('created_at', { ascending: false })) as Row[]).map(mapSaudaView);
}
export async function getSauda(id: string): Promise<SaudaView | null> {
  const row = check(await db().from('saudas').select(SAUDA_SELECT).eq('id', id).maybeSingle()) as Row | null;
  return row ? mapSaudaView(row) : null;
}
/** Oldest first, for timelines. */
export async function getSaudaEvents(saudaId: string): Promise<SaudaEvent[]> {
  return check(
    await db().from('sauda_events').select('*').eq('sauda_id', saudaId).order('created_at').order('id'),
  ) as SaudaEvent[];
}
export async function getEvidence(saudaId: string): Promise<Evidence[]> {
  const rows = check(await db().from('evidence').select('*').eq('sauda_id', saudaId).order('captured_at')) as Row[];
  return rows.map((r) => ({ ...(r as unknown as Evidence), lat: toNumOrNull(r.lat), lng: toNumOrNull(r.lng) }));
}
export async function getDisputes(): Promise<SaudaView[]> {
  const rows = check(await db().from('saudas').select(SAUDA_SELECT).eq('status', 'disputed').order('created_at')) as Row[];
  return rows.map(mapSaudaView);
}
export async function getAdminStats(): Promise<AdminStats> {
  const [saudas, profiles, active] = await Promise.all([
    db().from('saudas').select('status, final_amount, platform_fee'),
    db().from('profiles').select('role'),
    db().from('listings').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);
  const rows = check(saudas) as Row[];
  const roles = check(profiles) as Row[];
  if (active.error) throw new Error(`DB_ERROR:${active.error.message}`);
  const by_status: Record<SaudaStatus, number> = {
    token_due: 0, awaiting_collection: 0, collected: 0, disputed: 0, agreed: 0, settled: 0, cancelled: 0,
  };
  let settled_value = 0;
  let fee_revenue = 0;
  for (const r of rows) {
    const status = r.status as SaudaStatus;
    by_status[status] += 1;
    if (status === 'settled') {
      settled_value += toNum(r.final_amount ?? 0);
      fee_revenue += toNum(r.platform_fee ?? 0);
    }
  }
  return {
    settled_value,
    fee_revenue,
    active_listings: active.count ?? 0,
    by_status,
    open_disputes: by_status.disputed,
    farmers: roles.filter((r) => r.role === 'farmer').length,
    wholesalers: roles.filter((r) => r.role === 'wholesaler').length,
  };
}
