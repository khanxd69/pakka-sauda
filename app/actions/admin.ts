'use server';
// Pakka Sauda: admin actions. Owner: Workstream A. Signatures FROZEN (contracts-v1).
// resolveDispute is real (A2.5); setVerified (A3.4) and resetDemo (A3.5) come in phase 3.
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { ResolveDisputeSchema, type ResolveDisputeInput } from '@/lib/schemas';
import { requireUser } from '@/lib/session';
import { settle } from '@/lib/settle';
import { applyCancel, applyTransition, loadSauda } from '@/lib/transition';
import type { ActionResult, SaudaStatus } from '@/lib/types';
import { notImplemented, run } from './_result';

/** Reviewer rules a grade. disputed -> agreed (recalculated) or cancelled/grade_not_accepted. */
export async function resolveDispute(input: ResolveDisputeInput): Promise<ActionResult<{ status: SaudaStatus }>> {
  return run(async () => {
    const user = await requireUser('admin');
    const v = ResolveDisputeSchema.parse(input);
    const s = await loadSauda(v.saudaId);
    if (s.weighed_kg == null) throw new Error(`BAD_TRANSITION:resolveDispute:${s.status}`);
    const r = settle(s.terms, s.weighed_kg, v.grade);
    let status: SaudaStatus;
    if (r.outcome === 'payable') {
      await applyTransition({
        saudaId: s.id,
        action: 'resolveDispute',
        actor: user,
        to: 'agreed',
        patch: {
          resolved_grade: v.grade,
          resolution_note: v.note,
          final_amount: r.finalAmount,
          platform_fee: r.fee,
          agreed_at: new Date().toISOString(),
        },
        event: 'resolved',
        payload: { grade: v.grade, final_amount: r.finalAmount },
      });
      status = 'agreed';
    } else {
      await applyCancel({ saudaId: s.id, reason: 'grade_not_accepted', actor: user, note: v.note });
      const { error } = await db().from('saudas').update({ resolved_grade: v.grade, resolution_note: v.note }).eq('id', s.id);
      if (error) throw new Error(`DB_ERROR:${error.message}`);
      status = 'cancelled';
    }
    revalidatePath('/', 'layout');
    return { status };
  });
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
