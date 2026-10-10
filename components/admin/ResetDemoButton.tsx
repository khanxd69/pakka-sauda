'use client';
// Pakka Sauda: one-click demo reset for rehearsals (calls reset_demo()), behind a confirmation. Owner: Workstream D.
import { RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { resetDemo } from '@/app/actions/admin';
import { errorText } from '@/components/buyer/errors';

export function ResetDemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function reset() {
    if (!window.confirm('This wipes all demo deals for everyone and restores the seed. Continue?')) return;
    setBusy(true);
    const res = await resetDemo();
    setBusy(false);
    if (res.ok) toast.success('Demo reset');
    else toast.error(errorText(res.error));
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={reset}
      disabled={busy}
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-danger/30 text-[13px] font-medium text-danger transition-colors hover:bg-danger-soft disabled:opacity-50"
    >
      <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden />
      {busy ? 'Resetting…' : 'Reset demo'}
    </button>
  );
}
