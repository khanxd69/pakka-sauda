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
      aria-label={verified ? 'Verified: click to unverify' : 'Unverified: click to verify'}
      disabled={busy}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 disabled:opacity-50 ${verified ? 'bg-brand' : 'bg-line-strong'}`}
    >
      <span className={`absolute size-5 rounded-full bg-surface shadow-card transition-all duration-150 ${verified ? 'start-[22px]' : 'start-0.5'}`} />
    </button>
  );
}
