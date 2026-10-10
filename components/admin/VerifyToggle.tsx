'use client';
// Pakka Sauda: verified switch for one wholesaler. Owner: Workstream D.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { setVerified } from '@/app/actions/admin';
import { errorText } from '@/components/buyer/errors';

export function VerifyToggle({ profileId, verified }: { profileId: string; verified: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function toggle() {
    setBusy(true);
    const res = await setVerified(profileId, !verified);
    setBusy(false);
    if (!res.ok) toast.error(errorText(res.error));
    router.refresh();
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={verified}
      disabled={busy}
      onClick={toggle}
      className={`relative h-7 w-12 rounded-full transition ${verified ? 'bg-green-600' : 'bg-stone-300'} disabled:opacity-50`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${verified ? 'left-6' : 'left-1'}`} />
    </button>
  );
}
