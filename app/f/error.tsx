'use client';
// Pakka Sauda: farmer error state: plays and shows error_generic, with a retry button.
import { RotateCcw } from 'lucide-react';
import { BigButton } from '@/components/farmer/BigButton';
import { PromptHeading } from '@/components/farmer/PromptHeading';

export default function FarmerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-6 pt-10">
      <div className="rounded-2xl border border-danger/25 bg-danger-soft p-4">
        <PromptHeading clip="error_generic" autoPlay />
      </div>
      <BigButton variant="go" icon={<RotateCcw strokeWidth={1.75} aria-hidden />} onClick={reset} aria-label="دوبارہ / Try again" />
    </div>
  );
}
