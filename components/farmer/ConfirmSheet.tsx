'use client';
// Pakka Sauda: bottom sheet that plays a confirm prompt with the two standard buttons (✓ ہاں / ✗ نہیں). Owner: B.
import { Check, X } from 'lucide-react';
import type { ClipId } from '@/lib/voice/clips';
import { BigButton } from './BigButton';
import { PromptHeading } from './PromptHeading';

export function ConfirmSheet({
  open,
  clip,
  busy = false,
  onYes,
  onNo,
  children,
}: {
  open: boolean;
  clip: ClipId;
  busy?: boolean;
  onYes: () => void;
  onNo: () => void;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/40" role="dialog" aria-modal="true">
      <div className="pb-safe mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-3xl bg-surface px-5 pt-3 shadow-card">
        <span className="mx-auto h-1.5 w-12 rounded-full bg-line-strong" aria-hidden />
        <PromptHeading clip={clip} autoPlay size="md" />
        {children}
        <BigButton variant="go" icon={<Check strokeWidth={2.5} aria-hidden />} busy={busy} onClick={onYes}>
          ہاں
        </BigButton>
        <BigButton variant="stop" icon={<X strokeWidth={2} aria-hidden />} disabled={busy} onClick={onNo}>
          نہیں
        </BigButton>
      </div>
    </div>
  );
}
