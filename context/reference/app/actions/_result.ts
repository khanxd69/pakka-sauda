// Pakka Sauda: helpers every server action uses. Owner: Workstream A.
import type { ActionResult } from '@/lib/types';

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string): ActionResult<never> => ({ ok: false, error });
export const notImplemented = (): ActionResult<never> => fail('NOT_IMPLEMENTED');

/** Wrap an action body: thrown errors (Zod, TransitionError, DB) become { ok: false, error } instead of crashing the page. */
export async function run<T>(body: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await body());
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[action]', msg);
    return fail(msg);
  }
}
