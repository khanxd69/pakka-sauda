'use client';
// Pakka Sauda: error state for dashboard pages.
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-6" strokeWidth={1.5} aria-hidden />
      </span>
      <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="text-sm text-ink-muted">The page could not load. Nothing was changed. Try again, or choose a user again.</p>
      <div className="flex gap-2">
        <button type="button" onClick={reset} className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover">
          <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden />
          Try again
        </button>
        <Link href="/" className="inline-flex h-9 items-center rounded-lg border border-line-strong px-4 text-sm text-ink hover:bg-subtle">
          Choose user
        </Link>
      </div>
    </main>
  );
}
