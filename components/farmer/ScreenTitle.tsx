// Pakka Sauda: screen heading with the audio replay button next to it. Owner: Workstream B.
import type { ReactNode } from 'react';

export function ScreenTitle({ children, audio, sub }: { children?: ReactNode; audio?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 pt-5 pb-4">
      <div className="flex flex-col">
        <h1 className="text-[28px] font-bold leading-[1.9] text-ink">{children}</h1>
        {sub ? <p className="text-lg leading-[1.9] text-ink-muted">{sub}</p> : null}
      </div>
      {audio}
    </div>
  );
}
