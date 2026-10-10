// Pakka Sauda: "next action" text per sauda status for the wholesaler. Owner: Workstream D.
// Money comes from lib/settle.ts (balance at loading), never from inline maths.
import { formatDate, formatRs } from '@/lib/format';
import { settle } from '@/lib/settle';
import type { CancelReason, Sauda } from '@/lib/types';

export const CANCEL_TEXT: Record<CancelReason, string> = {
  token_expired: 'Token not paid in time',
  grade_not_accepted: 'Grade not accepted',
  shortfall: 'Weight shortfall',
  buyer_walked_away: 'Buyer walked away',
  crop_loss: 'Crop loss',
  farmer_sold_elsewhere: 'Farmer sold elsewhere',
  dispute_unresolved: 'Dispute unresolved',
};

export const timePK = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });

export function nextAction(s: Sauda): string {
  switch (s.status) {
    case 'token_due':
      return `Pay token by ${timePK(s.token_due_by)}`;
    case 'awaiting_collection':
      return `Collect on ${formatDate(s.terms.collection_date)}`;
    case 'collected':
      return 'Waiting for farmer';
    case 'disputed':
      return 'Under review';
    case 'agreed': {
      const grade = s.resolved_grade ?? s.delivered_grade;
      const r = grade && s.weighed_kg ? settle(s.terms, s.weighed_kg, grade) : null;
      return r?.outcome === 'payable' ? `Pay balance ${formatRs(r.balanceAtLoading)} at loading` : 'Pay balance at loading';
    }
    case 'settled':
      return 'Settled';
    case 'cancelled':
      return s.cancel_reason ? CANCEL_TEXT[s.cancel_reason] : 'Cancelled';
  }
}
