// Pakka Sauda design system: page title, description, actions and an optional breadcrumb.
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-7 flex flex-col gap-3 border-b border-line pb-6">
      {back ? (
        <Link href={back.href} className="inline-flex w-fit items-center gap-1 text-[13px] text-ink-muted transition-colors hover:text-ink">
          <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
