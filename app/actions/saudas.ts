'use server';
// Pakka Sauda: sauda lifecycle actions. Owner: Workstream A. Signatures FROZEN (contracts-v1).
// payToken is real (A1.6); the rest are stubs until A2.2-A2.6. All status changes go through lib/transition.ts.
import { revalidatePath } from 'next/cache';
import { newCollectionCode } from '@/lib/rules';
import { IdSchema, type CancelSaudaInput, type FarmerDisputeInput, type RecordCollectionInput } from '@/lib/schemas';
import { requireUser } from '@/lib/session';
import { applyTransition } from '@/lib/transition';
import type { ActionResult, SaudaStatus } from '@/lib/types';
import { notImplemented, run } from './_result';

/** Buyer pays the token (DEMO: no money moves). token_due -> awaiting_collection; issues collection_code. */
export async function payToken(saudaId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser('wholesaler');
    const id = IdSchema.parse(saudaId);
    // Token expiry check (TOKEN_EXPIRED) comes in A3.1.
    await applyTransition({
      saudaId: id,
      action: 'payToken',
      actor: user,
      to: 'awaiting_collection',
      patch: { token_paid_at: new Date().toISOString(), collection_code: newCollectionCode() },
      event: 'token_paid',
    });
    revalidatePath('/', 'layout');
    return null;
  });
}

/** Buyer records weighed kg + grade (+ note). Stores settle() result. awaiting_collection -> collected. */
export async function recordCollection(input: RecordCollectionInput): Promise<ActionResult> {
  void input;
  return notImplemented();
}

/** Farmer agrees with the recorded grade. collected -> agreed (priced grade) or cancelled/grade_not_accepted. */
export async function farmerConfirm(saudaId: string): Promise<ActionResult<{ status: SaudaStatus }>> {
  void saudaId;
  return notImplemented();
}

/** Farmer disputes the recorded grade. collected -> disputed. Nothing is loaded until resolved. */
export async function farmerDispute(input: FarmerDisputeInput): Promise<ActionResult> {
  void input;
  return notImplemented();
}

/** Farmer confirms he received the balance. agreed -> settled; platform fee becomes revenue. */
export async function confirmBalanceReceived(saudaId: string): Promise<ActionResult> {
  void saudaId;
  return notImplemented();
}

/** Cancel with a reason; lib/sauda-machine.ts CANCEL_RULES decides who may and where the token goes. */
export async function cancelSauda(input: CancelSaudaInput): Promise<ActionResult> {
  void input;
  return notImplemented();
}
