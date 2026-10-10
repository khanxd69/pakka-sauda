// Pakka Sauda: applies sauda state changes to the database. SERVER ONLY. Owner: Workstream A.
// REFERENCE IMPLEMENTATION for step A2.1. Every status change in the app goes through applyTransition or applyCancel.
// Each call: checks the rules (lib/sauda-machine.ts), checks the actor is a party to the sauda, updates the row only if
// the status has not changed since it was read (no double-submits), and writes exactly one sauda_events row.
import 'server-only';
import { db, toNum, toNumOrNull } from './db';
import {
  assertCancel, assertTransition, tokenDestination, TransitionError, type SaudaAction,
} from './sauda-machine';
import type { CancelReason, Profile, Sauda, SaudaEventType, SaudaStatus } from './types';

export async function loadSauda(id: string): Promise<Sauda> {
  const { data, error } = await db().from('saudas').select('*').eq('id', id).single();
  if (error || !data) throw new TransitionError('SAUDA_NOT_FOUND');
  return {
    ...data,
    weighed_kg: toNumOrNull(data.weighed_kg),
    final_amount: toNumOrNull(data.final_amount),
    platform_fee: toNumOrNull(data.platform_fee),
    terms: { ...data.terms, token_amount: toNum(data.terms.token_amount), fee_percent: toNum(data.terms.fee_percent) },
  } as Sauda;
}

function assertParty(s: Sauda, actor: Profile) {
  if (actor.role === 'admin') return;
  if (actor.role === 'farmer' && actor.id !== s.farmer_id) throw new TransitionError('NOT_YOUR_SAUDA');
  if (actor.role === 'wholesaler' && actor.id !== s.wholesaler_id) throw new TransitionError('NOT_YOUR_SAUDA');
}

async function writeGuarded(s: Sauda, to: SaudaStatus, patch: Record<string, unknown>) {
  const { data, error } = await db()
    .from('saudas')
    .update({ ...patch, status: to })
    .eq('id', s.id)
    .eq('status', s.status) // optimistic lock: fails if someone else moved it first
    .select('id');
  if (error) throw new Error(`DB_ERROR:${error.message}`);
  if (!data || data.length === 0) throw new TransitionError('CONCURRENT_UPDATE');
}

async function logEvent(saudaId: string, actorId: string | null, type: SaudaEventType, payload?: Record<string, unknown>) {
  const { error } = await db().from('sauda_events').insert({ sauda_id: saudaId, actor_id: actorId, type, payload: payload ?? null });
  if (error) throw new Error(`DB_ERROR:${error.message}`);
}

export async function applyTransition(args: {
  saudaId: string;
  action: SaudaAction;
  actor: Profile;
  to: SaudaStatus; // from sauda-machine (ALLOWED_FROM) or statusAfterGrade()
  patch?: Record<string, unknown>;
  event: SaudaEventType;
  payload?: Record<string, unknown>;
}): Promise<Sauda> {
  const s = await loadSauda(args.saudaId);
  assertTransition(args.action, s.status, args.actor.role);
  assertParty(s, args.actor);
  await writeGuarded(s, args.to, args.patch ?? {});
  await logEvent(s.id, args.actor.id, args.event, args.payload);
  return { ...s, ...(args.patch as Partial<Sauda>), status: args.to };
}

export async function applyCancel(args: { saudaId: string; reason: CancelReason; actor: Profile | null; note?: string }): Promise<Sauda> {
  const s = await loadSauda(args.saudaId);
  const role = args.actor?.role ?? 'admin'; // null actor = the system (token expiry)
  assertCancel(args.reason, s.status, role);
  if (args.actor) assertParty(s, args.actor);
  const token_to = tokenDestination(args.reason, s.token_paid_at != null);
  await writeGuarded(s, 'cancelled', { cancel_reason: args.reason, token_to, cancelled_at: new Date().toISOString() });
  await logEvent(s.id, args.actor?.id ?? null, 'cancelled', { reason: args.reason, token_to, note: args.note ?? null });
  if (args.reason === 'token_expired') {
    // reopen the listing so other buyers can bid again
    await db().from('listings').update({ status: 'open' }).eq('id', s.listing_id);
  }
  return { ...s, status: 'cancelled', cancel_reason: args.reason, token_to };
}
