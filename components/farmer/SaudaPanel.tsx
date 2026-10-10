'use client';
// Pakka Sauda: F9 status panel for the farmer; switches on the sauda status. Owner: Workstream B.
// Phase 1 covers token_due and awaiting_collection. Collection, dispute and payment screens come in phase 2.
import { DemoBadge } from '@/components/shared/DemoBadge';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import type { SaudaStatus } from '@/lib/types';

export function SaudaPanel({ status }: { status: SaudaStatus }) {
  if (status === 'token_due') {
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
  }
  if (status === 'awaiting_collection') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-green-50 p-5 text-center">
        <AudioPrompt clip="token_received" autoPlay />
        <span className="rounded-full bg-[#15803d] px-5 py-2 text-2xl font-bold text-white">✓ ٹوکن</span>
        <DemoBadge />
      </div>
    );
  }
  return (
    <div dir="ltr" className="rounded-3xl bg-stone-100 p-5 text-center text-stone-500">
      coming in phase 2
    </div>
  );
}
