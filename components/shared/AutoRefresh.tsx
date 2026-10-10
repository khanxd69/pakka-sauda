'use client';
// Pakka Sauda: re-renders server data every few seconds (our "realtime"). Owner: Workstream A. Real from Phase 0.
// Drop <AutoRefresh /> into any page whose data another person changes (offers, saudas, admin).
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AutoRefresh({ seconds = 3 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
