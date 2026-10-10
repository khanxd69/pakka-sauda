// Pakka Sauda design system: calm empty state with one optional action.
import type { ReactNode } from 'react';

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      {icon ? <span className="flex size-11 items-center justify-center rounded-full bg-subtle text-ink-muted [&_svg]:size-5">{icon}</span> : null}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? <p className="max-w-sm text-[13px] text-ink-muted">{description}</p> : null}
      {action}
    </div>
  );
}
