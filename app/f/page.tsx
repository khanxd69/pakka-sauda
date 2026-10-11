// Pakka Sauda: F1 farmer home. Owner: Workstream B.
import { HomeTiles } from '@/components/farmer/HomeTiles';
import { PotatoArt } from '@/components/farmer/PotatoArt';
import { PromptHeading } from '@/components/farmer/PromptHeading';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
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
      <div className="flex flex-col gap-5 pt-5">
        <div className="rounded-2xl border border-brand/10 bg-brand-soft/60 p-4"><PromptHeading clip="home_welcome" autoPlay /></div>
        {offers.length > 0 ? (
          <div className="rounded-2xl border border-attn/30 bg-attn-soft p-4">
            <PromptHeading clip="home_new_offers" autoPlay size="md" />
          </div>
        ) : null}
        <HomeTiles offers={offers.length} saudas={activeSaudas} needsAction={needsAction} />

        {open.length > 0 ? (
          <section className="flex flex-col gap-3 pt-2">
            {open.map((l) => (
              <div key={l.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-3 shadow-card">
                <PotatoArt kind={l.expected_grade} className="size-16 shrink-0 rounded-xl" />
                <span className="flex flex-1 flex-col">
                  <span dir="ltr" className="text-right text-xl font-semibold tabular-nums text-ink">
                    {formatKg(l.qty_low_kg)} – {formatKg(l.qty_high_kg)}
                  </span>
                  <span className="text-base text-ink-muted">
                    <span dir="ltr" className="tabular-nums">
                      {kgToMann(l.qty_low_kg).toLocaleString('en-IN')} – {kgToMann(l.qty_high_kg).toLocaleString('en-IN')}
                    </span>{' '}
                    من
                  </span>
                </span>
                <span className="flex flex-col items-center rounded-xl bg-attn-soft px-3 py-1 text-attn">
                  <span className="text-sm">بولیاں</span>
                  <span dir="ltr" className="text-xl font-semibold">
                    {l.bid_count}
                  </span>
                </span>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </>
  );
}
