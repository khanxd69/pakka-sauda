'use server';
// Pakka Sauda: listing actions. Owner: Workstream A. Signatures FROZEN (contracts-v1).
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { CreateListingSchema, type CreateListingInput } from '@/lib/schemas';
import { requireUser } from '@/lib/session';
import type { ActionResult } from '@/lib/types';
import { notImplemented, run } from './_result';

/** Farmer creates a listing. crop = 'potato', district = the farmer's district. Returns the new listing id. */
export async function createListing(input: CreateListingInput): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const user = await requireUser('farmer');
    const v = CreateListingSchema.parse(input);
    const { data, error } = await db()
      .from('listings')
      .insert({
        farmer_id: user.id,
        crop: 'potato',
        qty_low_kg: v.qtyLowKg,
        qty_high_kg: v.qtyHighKg,
        expected_grade: v.expectedGrade,
        min_price_per_kg: v.minPricePerKg,
        ready_from: v.readyFrom,
        ready_to: v.readyTo,
        district: user.district ?? 'Okara',
        voice_transcript: v.voiceTranscript ?? null,
      })
      .select('id')
      .single();
    if (error) throw new Error(`DB_ERROR:${error.message}`);
    revalidatePath('/', 'layout');
    return { id: data.id as string };
  });
}

/** Farmer withdraws an open listing (P1). Pending bids become 'rejected'. */
export async function cancelListing(listingId: string): Promise<ActionResult> {
  void listingId;
  return notImplemented();
}
