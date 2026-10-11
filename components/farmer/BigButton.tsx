'use client';
// Pakka Sauda: the farmer's only kind of button: full width, at least 56 px. Owner: Workstream B.
// go = solid green (yes / continue), stop = outlined red (no / dispute), plain = outlined neutral. Spinner when busy.
import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const VARIANT = {
  go: 'bg-brand text-white shadow-card hover:bg-brand-hover',
  stop: 'border-2 border-danger/40 bg-surface text-danger hover:bg-danger-soft',
  plain: 'border border-line-strong bg-surface text-ink hover:bg-subtle',
} as const;

export function BigButton({
  variant = 'go',
  busy = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof VARIANT; busy?: boolean; icon?: ReactNode }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || busy}
      aria-busy={busy}
      className={`flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-4 py-2 text-xl font-semibold transition-colors duration-150 active:scale-[0.99] disabled:opacity-45 [&_svg]:size-6 ${VARIANT[variant]} ${className ?? ''}`}
    >
      {busy ? (
        <LoaderCircle className="animate-spin" strokeWidth={2} aria-hidden />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

/** Bottom action bar, pinned above the safe area, for the screen's (at most two) primary actions. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="pb-safe sticky bottom-0 z-10 -mx-4 mt-6 flex flex-col gap-3 border-t border-line bg-page/95 px-4 pt-4 backdrop-blur">
      {children}
    </div>
  );
}
