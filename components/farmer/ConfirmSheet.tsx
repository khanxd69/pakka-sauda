'use client';
// Pakka Sauda: bottom sheet that plays a confirm prompt with the two standard buttons (✓ ہاں / ✗ نہیں). Owner: B.
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import type { ClipId } from '@/lib/voice/clips';
import { BigButton } from './BigButton';

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
    <div className="fixed inset-0 z-50 flex items-end bg-black/40" role="dialog" aria-modal="true">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl">
        <div className="flex justify-center">
          <AudioPrompt clip={clip} autoPlay />
        </div>
        {children}
        <BigButton variant="go" icon="✓" busy={busy} onClick={onYes}>
          ہاں
        </BigButton>
        <BigButton variant="stop" icon="✗" disabled={busy} onClick={onNo}>
          نہیں
        </BigButton>
      </div>
    </div>
  );
}
