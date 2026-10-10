// Pakka Sauda: wholesaler market grid with GET-form filters. Owner: Workstream D.
import { ListingCard } from '@/components/buyer/ListingCard';
import { RefPriceStrip } from '@/components/buyer/RefPriceStrip';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getOpenListings, getReferencePrices } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import type { Grade } from '@/lib/types';

type SP = Promise<{ district?: string; grade?: string; readyBy?: string }>;

export default async function MarketPage({ searchParams }: { searchParams: SP }) {
  await requireUser('wholesaler');
  const sp = await searchParams;
  const grade = sp.grade === 'A' || sp.grade === 'B' || sp.grade === 'C' ? (sp.grade as Grade) : undefined;
  const readyBy = sp.readyBy && /^\d{4}-\d{2}-\d{2}$/.test(sp.readyBy) ? sp.readyBy : undefined;
  const district = sp.district || undefined;
  const [listings, prices] = await Promise.all([getOpenListings({ district, grade, readyBy }), getReferencePrices()]);
  const select = 'h-9 rounded-lg border bg-white px-2 text-sm';

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Market</h1>
        <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
          <label className="flex flex-col gap-1">
            District
            <select name="district" defaultValue={district ?? ''} className={select}>
              <option value="">All</option>
              <option value="Okara">Okara</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Grade
            <select name="grade" defaultValue={grade ?? ''} className={select}>
              <option value="">All</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Ready by
            <input type="date" name="readyBy" defaultValue={readyBy ?? ''} className={select} />
          </label>
          <button type="submit" className="h-9 rounded-lg bg-stone-900 px-4 text-white">
            Filter
          </button>
        </form>
      </div>
      <RefPriceStrip prices={prices} />
      {listings.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-white p-8 text-center text-stone-500">No open listings match.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
