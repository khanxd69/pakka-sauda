// Pakka Sauda: read side. SERVER ONLY. Owner: Workstream A.
// PHASE 0 STUB: every function returns lib/fixtures.ts data so UI work can start immediately.
// Step A1.1 replaces each body with a Supabase query. SIGNATURES ARE FROZEN (contracts-v1): do not change them.
import 'server-only';
import type {
  AdminStats, BidView, Evidence, Grade, ListingView, Profile, ReferencePrice, SaudaEvent, SaudaView,
} from './types';
import * as fx from './fixtures';

export interface ListingFilters {
  district?: string;
  grade?: Grade;
  readyBy?: string; // ISO date: listings whose ready_from <= readyBy
}

export async function getProfiles(): Promise<Profile[]> {
  return fx.profiles;
}
export async function getProfile(id: string): Promise<Profile | null> {
  return fx.profiles.find((p) => p.id === id) ?? null;
}
export async function getWholesalers(): Promise<Profile[]> {
  return fx.profiles.filter((p) => p.role === 'wholesaler');
}
export async function getReferencePrices(): Promise<ReferencePrice[]> {
  return fx.referencePrices;
}
/** Open listings, newest first. */
export async function getOpenListings(filters: ListingFilters = {}): Promise<ListingView[]> {
  return fx.listings.filter(
    (l) =>
      l.status === 'open' &&
      (!filters.district || l.district === filters.district) &&
      (!filters.grade || l.expected_grade === filters.grade) &&
      (!filters.readyBy || l.ready_from <= filters.readyBy),
  );
}
export async function getListing(id: string): Promise<ListingView | null> {
  return fx.listings.find((l) => l.id === id) ?? null;
}
/** All of one farmer's listings (any status), newest first. */
export async function getMyListings(farmerId: string): Promise<ListingView[]> {
  return fx.listings.filter((l) => l.farmer_id === farmerId);
}
/** Pending bids on the farmer's OPEN listings: the F8 offers screen. Highest grade-A price first. */
export async function getOffersForFarmer(farmerId: string): Promise<BidView[]> {
  return fx.bids
    .filter((b) => b.status === 'pending' && b.listing.farmer_id === farmerId && b.listing.status === 'open')
    .sort((a, b) => b.price_a - a.price_a);
}
export async function getBidsForListing(listingId: string): Promise<BidView[]> {
  return fx.bids.filter((b) => b.listing_id === listingId);
}
export async function getMyBids(wholesalerId: string): Promise<BidView[]> {
  return fx.bids.filter((b) => b.wholesaler_id === wholesalerId);
}
/** Saudas where the user is the farmer or the buyer (admin: all). Newest first. */
export async function getSaudasForUser(user: Profile): Promise<SaudaView[]> {
  if (user.role === 'admin') return fx.saudas;
  return fx.saudas.filter((s) => s.farmer_id === user.id || s.wholesaler_id === user.id);
}
export async function getSauda(id: string): Promise<SaudaView | null> {
  return fx.saudas.find((s) => s.id === id) ?? null;
}
/** Oldest first, for timelines. */
export async function getSaudaEvents(saudaId: string): Promise<SaudaEvent[]> {
  void saudaId;
  return [];
}
export async function getEvidence(saudaId: string): Promise<Evidence[]> {
  void saudaId;
  return [];
}
export async function getDisputes(): Promise<SaudaView[]> {
  return fx.saudas.filter((s) => s.status === 'disputed');
}
export async function getAdminStats(): Promise<AdminStats> {
  return fx.adminStats;
}
