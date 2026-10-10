'use client';
// Pakka Sauda: F9-F11 status panel for the farmer; switches on the sauda status. Owner: Workstream B.
import { DemoBadge } from '@/components/shared/DemoBadge';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import type { SaudaView } from '@/lib/types';
import { BalancePanel } from './BalancePanel';
import { CodeBox } from './CodeBox';
import { CollectionReview } from './CollectionReview';
import { GradeCard } from './GradeCard';
import { CancelledPanel, SettledPanel } from './SettledPanel';

export function SaudaPanel({ sauda }: { sauda: SaudaView }) {
  switch (sauda.status) {
    case 'token_due':
      return (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-green-50 p-5 text-center">
          <span className="text-6xl">🤝</span>
          <div className="flex gap-3">
            <AudioPrompt clip="sauda_created" autoPlay />
            <AudioPrompt clip="token_waiting" autoPlay />
          </div>
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-amber-300 border-t-amber-700" aria-hidden />
        </div>
      );
    case 'awaiting_collection':
      return (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-green-50 p-5 text-center">
          <AudioPrompt clip="token_received" autoPlay />
          <span className="rounded-full bg-[#15803d] px-5 py-2 text-2xl font-bold text-white">✓ ٹوکن</span>
          <DemoBadge />
          {sauda.collection_code ? <CodeBox code={sauda.collection_code} /> : null}
        </div>
      );
    case 'collected':
      return <CollectionReview sauda={sauda} />;
    case 'disputed':
      return (
        <div className="flex flex-col gap-4 rounded-3xl bg-amber-50 p-5 text-center">
          <div className="flex justify-center">
            <AudioPrompt clip="dispute_sent" autoPlay />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-xl font-bold">آپ</span>
              {sauda.farmer_claimed_grade ? <GradeCard grade={sauda.farmer_claimed_grade} /> : null}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xl font-bold">خریدار</span>
              {sauda.delivered_grade ? <GradeCard grade={sauda.delivered_grade} /> : null}
            </div>
          </div>
          <span className="text-3xl font-bold">🥔 فصل آپ کے پاس رہے گی</span>
        </div>
      );
    case 'agreed':
      return <BalancePanel sauda={sauda} />;
    case 'settled':
      return <SettledPanel sauda={sauda} />;
    case 'cancelled':
      return <CancelledPanel sauda={sauda} />;
  }
}
