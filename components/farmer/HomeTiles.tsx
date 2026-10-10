// Pakka Sauda: the three home actions (sell, offers, my deals). Owner: Workstream B.
import Link from 'next/link';
import { Bell, ChevronLeft, Handshake } from 'lucide-react';
import { PotatoArt } from './PotatoArt';

function Count({ n, tone }: { n: number; tone: 'attn' | 'brand' | 'muted' }) {
  const cls = { attn: 'bg-attn text-white', brand: 'bg-brand text-white', muted: 'bg-subtle text-ink-muted' }[tone];
  return (
    <span dir="ltr" className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-lg font-semibold tabular-nums ${cls}`}>
      {n}
    </span>
  );
}

export function HomeTiles({ offers, saudas, needsAction = false }: { offers: number; saudas: number; needsAction?: boolean }) {
  return (
    <nav className="flex flex-col gap-3">
      <Link
        href="/f/sell"
        className="flex min-h-28 items-center gap-4 rounded-2xl bg-brand p-4 text-white shadow-card transition-colors duration-150 hover:bg-brand-hover active:scale-[0.99]"
      >
        <PotatoArt kind="crop" className="size-20 shrink-0 rounded-xl" />
        <span className="flex-1 text-[28px] font-bold leading-[1.9]">فصل بیچیں</span>
        <ChevronLeft className="size-7 shrink-0 opacity-80" strokeWidth={1.5} aria-hidden />
      </Link>

      <Link
        href="/f/offers"
        className={`relative flex min-h-24 items-center gap-4 rounded-2xl border bg-surface p-4 shadow-card transition-colors duration-150 hover:border-line-strong active:scale-[0.99] ${offers > 0 ? 'border-attn/40' : 'border-line'}`}
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-attn-soft text-attn">
          <Bell className="size-7" strokeWidth={1.5} aria-hidden />
        </span>
        <span className="flex-1 text-2xl font-semibold leading-[1.9] text-ink">بولیاں</span>
        <span className="relative">
          {offers > 0 ? <span className="absolute inset-0 animate-ping rounded-full bg-attn/30" aria-hidden /> : null}
          <Count n={offers} tone={offers > 0 ? 'attn' : 'muted'} />
        </span>
      </Link>

      <Link
        href="/f/saudas"
        className={`relative flex min-h-24 items-center gap-4 rounded-2xl border bg-surface p-4 shadow-card transition-colors duration-150 hover:border-line-strong active:scale-[0.99] ${needsAction ? 'border-brand/40' : 'border-line'}`}
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Handshake className="size-7" strokeWidth={1.5} aria-hidden />
        </span>
        <span className="flex-1 text-2xl font-semibold leading-[1.9] text-ink">میرے سودے</span>
        <span className="relative">
          {needsAction ? <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" aria-hidden /> : null}
          <Count n={saudas} tone={needsAction ? 'brand' : 'muted'} />
        </span>
      </Link>
    </nav>
  );
}
