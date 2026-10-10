// Pakka Sauda: sauda state machine. FROZEN after Phase 0. Owner: Workstream A.
// Pure rules only. lib/transition.ts (A, Phase 1) applies them to the database and writes sauda_events.
// No screen or action may change saudas.status except through these rules.
import type { CancelReason, Grade, Role, SaudaStatus, SaudaTerms, TokenTo } from './types';
import { settle } from './settle';

export type SaudaAction =
  | 'payToken' // token_due -> awaiting_collection (buyer)
  | 'recordCollection' // awaiting_collection -> collected (buyer)
  | 'farmerConfirm' // collected -> agreed, or -> cancelled if the grade was never priced (farmer)
  | 'farmerDispute' // collected -> disputed (farmer)
  | 'resolveDispute' // disputed -> agreed, or -> cancelled if the ruled grade was never priced (admin)
  | 'confirmBalanceReceived'; // agreed -> settled (farmer)

export const ALLOWED_FROM: Record<SaudaAction, readonly SaudaStatus[]> = {
  payToken: ['token_due'],
  recordCollection: ['awaiting_collection'],
  farmerConfirm: ['collected'],
  farmerDispute: ['collected'],
  resolveDispute: ['disputed'],
  confirmBalanceReceived: ['agreed'],
};

export const ALLOWED_ROLES: Record<SaudaAction, readonly Role[]> = {
  payToken: ['wholesaler'],
  recordCollection: ['wholesaler'],
  farmerConfirm: ['farmer'],
  farmerDispute: ['farmer'],
  resolveDispute: ['admin'],
  confirmBalanceReceived: ['farmer'],
};

export const CANCEL_RULES: Record<
  CancelReason,
  { from: readonly SaudaStatus[]; by: readonly Role[]; tokenTo: TokenTo }
> = {
  token_expired: { from: ['token_due'], by: ['admin'], tokenTo: 'buyer' },
  grade_not_accepted: { from: ['collected', 'disputed'], by: ['farmer', 'admin'], tokenTo: 'buyer' },
  shortfall: { from: ['collected'], by: ['wholesaler'], tokenTo: 'buyer' },
  buyer_walked_away: { from: ['token_due', 'awaiting_collection'], by: ['wholesaler', 'admin'], tokenTo: 'farmer' },
  crop_loss: { from: ['awaiting_collection'], by: ['admin'], tokenTo: 'buyer' },
  farmer_sold_elsewhere: { from: ['awaiting_collection'], by: ['admin'], tokenTo: 'buyer' },
  dispute_unresolved: { from: ['disputed'], by: ['admin'], tokenTo: 'buyer' },
};

export class TransitionError extends Error {}

export function assertTransition(action: SaudaAction, from: SaudaStatus, role: Role): void {
  if (!ALLOWED_ROLES[action].includes(role)) throw new TransitionError(`ROLE_NOT_ALLOWED:${action}:${role}`);
  if (!ALLOWED_FROM[action].includes(from)) throw new TransitionError(`BAD_TRANSITION:${action}:${from}`);
}

export function assertCancel(reason: CancelReason, from: SaudaStatus, role: Role): void {
  const rule = CANCEL_RULES[reason];
  if (!rule.by.includes(role)) throw new TransitionError(`ROLE_NOT_ALLOWED:cancel:${reason}:${role}`);
  if (!rule.from.includes(from)) throw new TransitionError(`BAD_TRANSITION:cancel:${reason}:${from}`);
}

/** Who keeps the token when a sauda is cancelled. null when no token was ever paid. */
export function tokenDestination(reason: CancelReason, tokenPaid: boolean): TokenTo | null {
  return tokenPaid ? CANCEL_RULES[reason].tokenTo : null;
}

/** After the farmer confirms (or the reviewer rules) a grade: a priced grade -> agreed; an unpriced grade -> cancelled. */
export function statusAfterGrade(terms: SaudaTerms, weighedKg: number, grade: Grade): 'agreed' | 'cancelled' {
  return settle(terms, weighedKg, grade).outcome === 'payable' ? 'agreed' : 'cancelled';
}

export const STATUS_LABEL: Record<SaudaStatus, { en: string; ur: string }> = {
  token_due: { en: 'Token due', ur: 'ٹوکن باقی ہے' },
  awaiting_collection: { en: 'Awaiting collection', ur: 'فصل اٹھانے کا انتظار' },
  collected: { en: 'Collected, awaiting farmer', ur: 'وزن ہو گیا' },
  disputed: { en: 'Disputed', ur: 'اعتراض درج ہے' },
  agreed: { en: 'Agreed, balance due', ur: 'طے ہو گیا' },
  settled: { en: 'Settled', ur: 'سودا مکمل' },
  cancelled: { en: 'Cancelled', ur: 'منسوخ' },
};
