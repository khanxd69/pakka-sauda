// Pakka Sauda: the three huge home tiles (sell, offers, my deals). Owner: Workstream B.
import Link from 'next/link';

function Count({ n, pulse }: { n: number; pulse?: boolean }) {
  return (
    <span
      dir="ltr"
      className={`flex h-12 min-w-12 items-center justify-center rounded-full bg-white px-3 text-2xl font-bold text-stone-900 ${pulse ? 'animate-pulse ring-4 ring-amber-300' : ''}`}
    >
      {n}
    </span>
  );
}

export function HomeTiles({ offers, saudas, needsAction = false }: { offers: number; saudas: number; needsAction?: boolean }) {
  const tile = 'flex min-h-28 w-full items-center justify-between gap-4 rounded-3xl px-6 text-3xl font-bold shadow-md active:scale-[0.98]';
  return (
    <nav className="flex flex-col gap-4">
      <Link href="/f/sell" className={`${tile} bg-[#15803d] text-white`}>
        <span>فصل بیچیں</span>
        <span className="text-6xl">🥔</span>
      </Link>
      <Link href="/f/offers" className={`${tile} bg-amber-500 text-white`}>
        <span>بولیاں</span>
        <Count n={offers} pulse={offers > 0} />
      </Link>
      <Link href="/f/saudas" className={`${tile} bg-sky-700 text-white`}>
        <span>میرے سودے</span>
        <Count n={saudas} pulse={needsAction} />
      </Link>
    </nav>
  );
}
