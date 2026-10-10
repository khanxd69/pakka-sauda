// Pakka Sauda: screen heading with the audio replay button next to it. Owner: Workstream B.
import type { ReactNode } from 'react';

export function ScreenTitle({ children, audio }: { children?: ReactNode; audio?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <h1 className="text-2xl font-bold">{children}</h1>
      {audio}
    </div>
  );
}
