'use client';
// Pakka Sauda: runs one farmer server action with a busy flag; on error plays error_generic and refreshes. Owner: B.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { playUrl, schedule } from '@/components/voice/player';
import type { ActionResult } from '@/lib/types';
import { clipUrl } from '@/lib/voice/clips';

export function useFarmerAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function act<T>(call: () => Promise<ActionResult<T>>): Promise<boolean> {
    setBusy(true);
    const res = await call();
    setBusy(false);
    if (!res.ok) void schedule(() => playUrl(clipUrl('error_generic')), 'now');
    router.refresh();
    return res.ok;
  }
  return { busy, act };
}
