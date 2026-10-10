'use server';
// Pakka Sauda: admin actions. Owner: Workstream A. PHASE 0 STUB. Signatures FROZEN (contracts-v1).
// Real implementations: A2.5 (resolveDispute), A3.4 (setVerified), A3.5 (resetDemo).
import type { ActionResult, SaudaStatus } from '@/lib/types';
import type { ResolveDisputeInput } from '@/lib/schemas';
import { notImplemented } from './_result';

/** Reviewer rules a grade. disputed -> agreed (recalculated) or cancelled/grade_not_accepted. */
export async function resolveDispute(input: ResolveDisputeInput): Promise<ActionResult<{ status: SaudaStatus }>> {
  void input;
  return notImplemented();
}

export async function setVerified(profileId: string, verified: boolean): Promise<ActionResult> {
  void profileId;
  void verified;
  return notImplemented();
}

/** Calls the reset_demo() SQL function. Rehearsals only. */
export async function resetDemo(): Promise<ActionResult> {
  return notImplemented();
}
