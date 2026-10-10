'use client';
// Pakka Sauda: online/offline state for farmer screens (navigator.onLine + events). Owner: Workstream C.
// B uses it to play the `offline` clip and disable submit buttons while there is no connection.
import { useEffect, useState } from 'react';

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return online;
}
