'use server';
// Pakka Sauda: evidence photo upload (P1). Owner: Workstream A. PHASE 0 STUB. Signature FROZEN (contracts-v1).
// Real implementation: step A3.3. FormData fields: saudaId, kind ('collection'|'dispute'), file (image), lat?, lng?
import type { ActionResult } from '@/lib/types';
import { notImplemented } from './_result';

export async function uploadEvidence(form: FormData): Promise<ActionResult<{ id: string; url: string }>> {
  void form;
  return notImplemented();
}
