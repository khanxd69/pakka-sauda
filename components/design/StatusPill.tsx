// Pakka Sauda design system: one pill for every sauda / bid / listing status. Text comes from STATUS_LABEL.
import { STATUS_LABEL } from '@/lib/sauda-machine';
import type { BidStatus, ListingStatus, SaudaStatus } from '@/lib/types';
import { Pill, type Tone } from './Pill';

const SAUDA_TONE: Record<SaudaStatus, Tone> = {
  token_due: 'warning',
  awaiting_collection: 'info',
  collected: 'attn',
  disputed: 'danger',
  agreed: 'brand',
  settled: 'success',
  cancelled: 'neutral',
};
const BID_TONE: Record<BidStatus, Tone> = { pending: 'warning', accepted: 'success', rejected: 'neutral', withdrawn: 'neutral' };
const LISTING_TONE: Record<ListingStatus, Tone> = { open: 'brand', sold: 'info', cancelled: 'neutral' };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function StatusPill(
  p: { kind: 'sauda'; status: SaudaStatus; lang?: 'en' | 'ur' } | { kind: 'bid'; status: BidStatus } | { kind: 'listing'; status: ListingStatus },
) {
  if (p.kind === 'sauda') {
    return (
      <Pill tone={SAUDA_TONE[p.status]} dot>
        {STATUS_LABEL[p.status][p.lang ?? 'en']}
      </Pill>
    );
  }
  if (p.kind === 'bid') return <Pill tone={BID_TONE[p.status]} dot>{cap(p.status)}</Pill>;
  return <Pill tone={LISTING_TONE[p.status]} dot>{cap(p.status)}</Pill>;
}
