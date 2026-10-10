'use client';
// Pakka Sauda: the farmer's only kind of button: full width, at least 56 px. Owner: Workstream B.
// go = green (yes / continue), stop = red (no / dispute), plain = neutral. Shows a spinner when busy.
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const VARIANT = {
  go: 'bg-[#15803d] text-white',
  stop: 'bg-[#b91c1c] text-white',
  plain: 'bg-white text-stone-800 border-2 border-stone-300',
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
      className={`flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-4 text-2xl font-bold shadow-sm transition active:scale-[0.98] disabled:opacity-50 ${VARIANT[variant]} ${className ?? ''}`}
    >
      {busy ? (
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-current/30 border-t-current" aria-hidden />
      ) : (
        <>
          {icon ? <span className="text-3xl leading-none">{icon}</span> : null}
          {children}
        </>
      )}
    </button>
  );
}
