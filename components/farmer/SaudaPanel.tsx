'use client';
// Pakka Sauda: F9-F11 status panel for the farmer; switches on the sauda status. Owner: Workstream B.
import { CircleCheck, Hourglass, Scale } from 'lucide-react';
import { DemoBadge } from '@/components/shared/DemoBadge';
import type { SaudaView } from '@/lib/types';
import { BalancePanel } from './BalancePanel';
import { CodeBox } from './CodeBox';
import { CollectionReview } from './CollectionReview';
import { GradeCard } from './GradeCard';
import { PromptHeading } from './PromptHeading';
import { CancelledPanel, SettledPanel } from './SettledPanel';

export function SaudaPanel({ sauda }: { sauda: SaudaView }) {
  switch (sauda.status) {
    case 'token_due':
      return (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <PromptHeading clip="sauda_created" autoPlay />
          <div className="flex items-center gap-3 rounded-xl bg-warning-soft p-3">
            <Hourglass className="size-6 shrink-0 animate-pulse text-warning" strokeWidth={1.5} aria-hidden />
            <div className="flex-1">
              <PromptHeading clip="token_waiting" autoPlay size="md" />
            </div>
          </div>
        </div>
      );
    case 'awaiting_collection':
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-success/25 bg-success-soft p-4">
            <div className="flex items-center gap-3">
              <CircleCheck className="size-7 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
              <div className="flex-1">
                <PromptHeading clip="token_received" autoPlay size="md" />
              </div>
            </div>
            <DemoBadge />
          </div>
          {sauda.collection_code ? <CodeBox code={sauda.collection_code} /> : null}
        </div>
      );
    case 'collected':
      return <CollectionReview sauda={sauda} />;
    case 'disputed':
      return (
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <PromptHeading clip="dispute_sent" autoPlay size="md" />
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold text-ink">آپ</span>
              {sauda.farmer_claimed_grade ? <GradeCard grade={sauda.farmer_claimed_grade} /> : null}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold text-ink-muted">خریدار</span>
              {sauda.delivered_grade ? <GradeCard grade={sauda.delivered_grade} /> : null}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-brand-soft p-4 text-brand">
            <Scale className="size-7 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="text-2xl font-bold leading-[1.9]">فصل آپ کے پاس رہے گی</span>
          </div>
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
