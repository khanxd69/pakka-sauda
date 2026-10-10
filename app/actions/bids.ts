'use server';
// Pakka Sauda: bid actions. Owner: Workstream A. Signatures FROZEN (contracts-v1).
import { revalidatePath } from 'next/cache';
import { CONFIG } from '@/lib/config';
import { db, toNum } from '@/lib/db';
import { validateBid } from '@/lib/rules';
import { IdSchema, PlaceBidSchema, type PlaceBidInput } from '@/lib/schemas';
import { requireUser } from '@/lib/session';
import type { ActionResult, Grade, ListingStatus } from '@/lib/types';
import { notImplemented, run } from './_result';

/** Wholesaler places or replaces (upsert) his bid on a listing. Runs validateBid(). Returns the bid id. */
export async function placeBid(input: PlaceBidInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await requireUser('wholesaler');
    const v = PlaceBidSchema.parse(input);
    const { data: l, error: le } = await db()
      .from('listings')
      .select('status, expected_grade, min_price_per_kg, ready_from')
      .eq('id', v.listingId)
      .maybeSingle();
    if (le) throw new Error(`DB_ERROR:${le.message}`);
    if (!l) throw new Error('LISTING_NOT_OPEN');
    const ruleError = validateBid(
      {
        status: l.status as ListingStatus,
        expected_grade: l.expected_grade as Grade,
        min_price_per_kg: toNum(l.min_price_per_kg),
        ready_from: l.ready_from as string,
      },
      v,
    );
    if (ruleError) throw new Error(ruleError);
    const { data, error } = await db()
      .from('bids')
      .upsert(
        {
          listing_id: v.listingId,
          wholesaler_id: user.id,
          price_a: v.priceA,
          price_b: v.priceB,
          price_c: v.priceC,
          collection_date: v.collectionDate,
          loading_paid_by: v.loadingPaidBy,
          note: v.note ?? null,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        { onConflict: 'listing_id,wholesaler_id' },
      )
      .select('id')
      .single();
    if (error) throw new Error(`DB_ERROR:${error.message}`);
    revalidatePath('/', 'layout');
    return { id: data.id as string };
  });
}

/** Wholesaler withdraws his own pending bid. */
export async function withdrawBid(bidId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser('wholesaler');
    const id = IdSchema.parse(bidId);
    const { data: bid, error: be } = await db().from('bids').select('wholesaler_id, status').eq('id', id).maybeSingle();
    if (be) throw new Error(`DB_ERROR:${be.message}`);
    if (!bid || bid.wholesaler_id !== user.id) throw new Error('NOT_YOUR_BID');
    if (bid.status !== 'pending') throw new Error('BID_NOT_PENDING');
    const { data, error } = await db()
      .from('bids')
      .update({ status: 'withdrawn' })
      .eq('id', id)
      .eq('status', 'pending')
      .select('id');
    if (error) throw new Error(`DB_ERROR:${error.message}`);
    if (!data || data.length === 0) throw new Error('BID_NOT_PENDING');
    revalidatePath('/', 'layout');
    return null;
  });
}

/** Farmer accepts a pending bid on his own open listing. Calls accept_bid() RPC. Returns the new sauda id. */
export async function acceptBid(bidId: string): Promise<ActionResult<{ saudaId: string }>> {
  return run(async () => {
    const user = await requireUser('farmer');
    const id = IdSchema.parse(bidId);
    const { data: bid, error: be } = await db()
      .from('bids')
      .select('id, listing:listings(farmer_id)')
      .eq('id', id)
      .maybeSingle();
    if (be) throw new Error(`DB_ERROR:${be.message}`);
    const listing = bid?.listing as unknown as { farmer_id: string } | null;
    if (!bid) throw new Error('BID_NOT_PENDING');
    if (!listing || listing.farmer_id !== user.id) throw new Error('NOT_YOUR_LISTING');
    const { data, error } = await db().rpc('accept_bid', {
      p_bid: id,
      p_token_pct: CONFIG.TOKEN_PERCENT,
      p_fee_pct: CONFIG.FEE_PERCENT,
      p_token_window_minutes: CONFIG.TOKEN_WINDOW_MINUTES,
    });
    if (error) {
      if (error.message.includes('BID_NOT_PENDING')) throw new Error('BID_NOT_PENDING');
      if (error.message.includes('LISTING_NOT_OPEN')) throw new Error('LISTING_NOT_OPEN');
      throw new Error(`DB_ERROR:${error.message}`);
    }
    revalidatePath('/', 'layout');
    return { saudaId: data as string };
  });
}

/** Farmer declines one pending bid (P1). */
export async function rejectBid(bidId: string): Promise<ActionResult> {
  void bidId;
  return notImplemented();
}
