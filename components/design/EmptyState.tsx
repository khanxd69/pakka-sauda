// Pakka Sauda design system: calm empty state with one optional action.
import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line-strong bg-surface/70 px-6 py-16 text-center">
      {icon ? <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand [&_svg]:size-7">{icon}</span> : null}
      <p className="text-base font-semibold text-ink">{title}</p>
      {description ? <p className="max-w-sm text-[13px] text-ink-muted">{description}</p> : null}
      {action}
    </div>
  );
}
