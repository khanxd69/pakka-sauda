'use client';
// Pakka Sauda: one-click demo reset for rehearsals (calls reset_demo()). Owner: Workstream D.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { resetDemo } from '@/app/actions/admin';
import { errorText } from '@/components/buyer/errors';
import { Button } from '@/components/ui/button';

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
    <Button variant="destructive" onClick={reset} disabled={busy}>
      {busy ? 'Resetting…' : 'Reset demo'}
    </Button>
  );
}
