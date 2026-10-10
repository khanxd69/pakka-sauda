// Pakka Sauda: F1 farmer home. Owner: Workstream B.
import { HomeTiles } from '@/components/farmer/HomeTiles';
import { ScreenTitle } from '@/components/farmer/ScreenTitle';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { AudioPrompt } from '@/components/voice/AudioPrompt';
import { formatKg, kgToMann } from '@/lib/format';
import { getMyListings, getOffersForFarmer, getSaudasForUser } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function FarmerHome() {
  const user = await requireUser('farmer');
  const [listings, offers, saudas] = await Promise.all([
    getMyListings(user.id),
    getOffersForFarmer(user.id),
    getSaudasForUser(user),
  ]);
  const activeSaudas = saudas.filter((s) => s.status !== 'settled' && s.status !== 'cancelled').length;
  const needsAction = saudas.some((s) => s.status === 'collected' || s.status === 'agreed');
  const open = listings.filter((l) => l.status === 'open');

  return (
    <>
      <AutoRefresh />
      <ScreenTitle
        audio={
          <div className="flex gap-2">
            <AudioPrompt clip="home_welcome" autoPlay />
            {offers.length > 0 ? <AudioPrompt clip="home_new_offers" autoPlay className="h-16 w-16 animate-pulse rounded-full bg-amber-300 text-3xl" /> : null}
          </div>
        }
      >
        🥔
      </ScreenTitle>
      <HomeTiles offers={offers.length} saudas={activeSaudas} needsAction={needsAction} />

      {open.length > 0 ? (
        <section className="mt-8 flex flex-col gap-3">
          {open.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4">
              <span className="text-4xl">🥔</span>
              <span className="flex flex-col items-center" dir="ltr">
                <span className="text-xl font-bold tabular-nums">
                  {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
                </span>
                <span className="text-lg text-stone-600 tabular-nums">
                  {kgToMann(l.qty_low_kg).toLocaleString('en-IN')} – {kgToMann(l.qty_high_kg).toLocaleString('en-IN')} من
                </span>
              </span>
              <span className="flex flex-col items-center text-amber-700">
                <span className="text-sm">بولیاں</span>
                <span dir="ltr" className="text-2xl font-bold">{l.bid_count}</span>
              </span>
            </div>
          ))}
        </section>
      ) : null}
    </>
  );
}
