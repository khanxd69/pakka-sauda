'use server';
// Pakka Sauda: sauda lifecycle actions. Owner: Workstream A. PHASE 0 STUB. Signatures FROZEN (contracts-v1).
// Real implementations: steps A1.6 (payToken) and A2.2-A2.6. All go through lib/transition.ts.
import type { ActionResult, SaudaStatus } from '@/lib/types';
import type { CancelSaudaInput, FarmerDisputeInput, RecordCollectionInput } from '@/lib/schemas';
import { notImplemented } from './_result';

/** Buyer pays the token (DEMO: no money moves). token_due -> awaiting_collection; issues collection_code. */
export async function payToken(saudaId: string): Promise<ActionResult> {
  void saudaId;
  return notImplemented();
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
