'use server';
// Pakka Sauda: sauda lifecycle actions. Owner: Workstream A. Signatures FROZEN (contracts-v1).
// Every status change goes through lib/transition.ts; every rupee amount comes from lib/settle.ts.
import { revalidatePath } from 'next/cache';
import { newCollectionCode } from '@/lib/rules';
import { statusAfterGrade } from '@/lib/sauda-machine';
import {
  CancelSaudaSchema, FarmerDisputeSchema, IdSchema, RecordCollectionSchema,
  type CancelSaudaInput, type FarmerDisputeInput, type RecordCollectionInput,
} from '@/lib/schemas';
import { requireUser } from '@/lib/session';
import { isShortfall, settle } from '@/lib/settle';
import { applyCancel, applyTransition, loadSauda } from '@/lib/transition';
import type { ActionResult, SaudaStatus } from '@/lib/types';
import { run } from './_result';

const now = () => new Date().toISOString();

/** Buyer pays the token (DEMO: no money moves). token_due -> awaiting_collection; issues collection_code. */
export async function payToken(saudaId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser('wholesaler');
    const id = IdSchema.parse(saudaId);
    const s = await loadSauda(id);
    if (s.status === 'token_due' && new Date(s.token_due_by) < new Date()) {
      // Window passed: the system cancels (listing reopens) and the buyer is told why.
      await applyCancel({ saudaId: id, reason: 'token_expired', actor: null });
      revalidatePath('/', 'layout');
      throw new Error('TOKEN_EXPIRED');
    }
    await applyTransition({
      saudaId: id,
      action: 'payToken',
      actor: user,
      to: 'awaiting_collection',
      patch: { token_paid_at: now(), collection_code: newCollectionCode() },
      event: 'token_paid',
    });
    revalidatePath('/', 'layout');
    return null;
  });
}

/** Buyer records weighed kg + grade (+ note). Stores settle() result. awaiting_collection -> collected. */
export async function recordCollection(input: RecordCollectionInput): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser('wholesaler');
    const v = RecordCollectionSchema.parse(input);
    const s = await loadSauda(v.saudaId);
    const r = settle(s.terms, v.weighedKg, v.grade);
    await applyTransition({
      saudaId: s.id,
      action: 'recordCollection',
      actor: user,
      to: 'collected',
      patch: {
        weighed_kg: v.weighedKg,
        delivered_grade: v.grade,
        buyer_note: v.note ?? null,
        final_amount: r.outcome === 'payable' ? r.finalAmount : null,
        platform_fee: r.outcome === 'payable' ? r.fee : null,
      },
      event: 'collected',
      payload: { weighed_kg: v.weighedKg, grade: v.grade, outcome: r.outcome },
    });
    revalidatePath('/', 'layout');
    return null;
  });
}

/** Farmer agrees with the recorded grade. collected -> agreed (priced grade) or cancelled/grade_not_accepted. */
export async function farmerConfirm(saudaId: string): Promise<ActionResult<{ status: SaudaStatus }>> {
  return run(async () => {
    const user = await requireUser('farmer');
    const id = IdSchema.parse(saudaId);
    const s = await loadSauda(id);
    if (s.weighed_kg == null || s.delivered_grade == null) throw new Error(`BAD_TRANSITION:farmerConfirm:${s.status}`);
    const to = statusAfterGrade(s.terms, s.weighed_kg, s.delivered_grade);
    if (to === 'agreed') {
      await applyTransition({ saudaId: id, action: 'farmerConfirm', actor: user, to: 'agreed', patch: { agreed_at: now() }, event: 'confirmed' });
    } else {
      await applyCancel({ saudaId: id, reason: 'grade_not_accepted', actor: user });
    }
    revalidatePath('/', 'layout');
    return { status: to };
  });
}

/** Farmer disputes the recorded grade. collected -> disputed. Nothing is loaded until resolved. */
export async function farmerDispute(input: FarmerDisputeInput): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser('farmer');
    const v = FarmerDisputeSchema.parse(input);
    await applyTransition({
      saudaId: v.saudaId,
      action: 'farmerDispute',
      actor: user,
      to: 'disputed',
      patch: { farmer_claimed_grade: v.claimedGrade, dispute_reason: v.reason ?? null },
      event: 'disputed',
      payload: { claimedGrade: v.claimedGrade, reason: v.reason ?? null },
    });
    revalidatePath('/', 'layout');
    return null;
  });
}

/** Farmer confirms he received the balance. agreed -> settled; platform fee becomes revenue. */
export async function confirmBalanceReceived(saudaId: string): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser('farmer');
    const id = IdSchema.parse(saudaId);
    await applyTransition({
      saudaId: id,
      action: 'confirmBalanceReceived',
      actor: user,
      to: 'settled',
      patch: { settled_at: now() },
      event: 'balance_received',
    });
    revalidatePath('/', 'layout');
    return null;
  });
}

/** Cancel with a reason; lib/sauda-machine.ts CANCEL_RULES decides who may and where the token goes. */
export async function cancelSauda(input: CancelSaudaInput): Promise<ActionResult> {
  return run(async () => {
    const user = await requireUser();
    const v = CancelSaudaSchema.parse(input);
    if (v.reason === 'shortfall') {
      const s = await loadSauda(v.saudaId);
      if (s.weighed_kg == null || !isShortfall(s.terms, s.weighed_kg)) throw new Error('NOT_A_SHORTFALL');
    }
    await applyCancel({ saudaId: v.saudaId, reason: v.reason, actor: user });
    revalidatePath('/', 'layout');
    return null;
  });
}
