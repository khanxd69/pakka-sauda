'use server';
// Pakka Sauda: bid actions. Owner: Workstream A. PHASE 0 STUB. Signatures FROZEN (contracts-v1).
// Real implementations: steps A1.4 and A1.5.
import type { ActionResult } from '@/lib/types';
import type { PlaceBidInput } from '@/lib/schemas';
import { notImplemented } from './_result';

/** Wholesaler places or replaces (upsert) his bid on a listing. Runs validateBid(). Returns the bid id. */
export async function placeBid(input: PlaceBidInput): Promise<ActionResult<{ id: string }>> {
  void input;
  return notImplemented();
}

/** Wholesaler withdraws his own pending bid. */
export async function withdrawBid(bidId: string): Promise<ActionResult> {
  void bidId;
  return notImplemented();
}

/** Farmer accepts a pending bid on his own open listing. Calls accept_bid() RPC. Returns the new sauda id. */
export async function acceptBid(bidId: string): Promise<ActionResult<{ saudaId: string }>> {
  void bidId;
  return notImplemented();
}

/** Farmer declines one pending bid (P1). */
export async function rejectBid(bidId: string): Promise<ActionResult> {
  void bidId;
  return notImplemented();
}
