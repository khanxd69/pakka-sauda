'use server';
// Pakka Sauda: listing actions. Owner: Workstream A. PHASE 0 STUB. Signatures FROZEN (contracts-v1).
// Real implementation: step A1.3.
import type { ActionResult } from '@/lib/types';
import type { CreateListingInput } from '@/lib/schemas';
import { notImplemented } from './_result';

/** Farmer creates a listing. crop = 'potato', district = the farmer's district. Returns the new listing id. */
export async function createListing(input: CreateListingInput): Promise<ActionResult<{ id: string }>> {
  void input;
  return notImplemented();
}

/** Farmer withdraws an open listing (P1). Pending bids become 'rejected'. */
export async function cancelListing(listingId: string): Promise<ActionResult> {
  void listingId;
  return notImplemented();
}
