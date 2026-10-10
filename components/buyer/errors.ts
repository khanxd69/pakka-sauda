// Pakka Sauda: maps action error codes (04-contracts.md section 9) to readable English. Owner: Workstream D.
import { BID_ERROR_TEXT, type BidRuleError } from '@/lib/rules';

export function errorText(code: string): string {
  if (code in BID_ERROR_TEXT) return BID_ERROR_TEXT[code as BidRuleError];
  if (code === 'NOT_IMPLEMENTED') return 'Not built yet.';
  if (code === 'NOT_SIGNED_IN' || code === 'WRONG_ROLE') return 'Please choose a user again.';
  if (code === 'BID_NOT_PENDING') return 'This bid is no longer open.';
  if (code === 'TOKEN_EXPIRED') return 'Token window passed; the listing has reopened.';
  if (code.startsWith('BAD_TRANSITION') || code === 'CONCURRENT_UPDATE') return 'Someone already updated this deal. Refreshing…';
  if (code === 'NOT_YOUR_SAUDA' || code === 'NOT_YOUR_LISTING' || code === 'NOT_YOUR_BID' || code.startsWith('ROLE_NOT_ALLOWED'))
    return 'Not allowed.';
  if (code === 'NOT_A_SHORTFALL') return 'Weight is not below 80% of the low estimate.';
  if (code === 'FILE_TOO_LARGE') return 'Photo is too large (max 5 MB).';
  if (code === 'NOT_AN_IMAGE') return 'That file is not an image.';
  return code.startsWith('DB_ERROR') ? 'Something went wrong. Please try again.' : code;
}
