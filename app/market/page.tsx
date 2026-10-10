// Pakka Sauda: /market listing grid (D1.2). Filters live in the URL (?district=&grade=&readyBy=) via a plain GET form.
import Link from 'next/link';
import { ListingCard } from '@/components/buyer/ListingCard';
import { RefPriceStrip } from '@/components/buyer/RefPriceStrip';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getOpenListings, getReferencePrices, type ListingFilters } from '@/lib/queries';
import { GRADES, type Grade } from '@/lib/types';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const isGrade = (v: string | undefined): v is Grade => !!v && (GRADES as readonly string[]).includes(v);
const isIsoDate = (v: string | undefined): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

const selectClass =
  'h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50';

export default async function MarketPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const grade = first(sp.grade);
  const readyBy = first(sp.readyBy);
  // Ignore malformed filter values instead of passing them to the query.
  const filters: ListingFilters = {
    district: first(sp.district),
    grade: isGrade(grade) ? grade : undefined,
    readyBy: isIsoDate(readyBy) ? readyBy : undefined,
  };

  const [listings, allOpen, prices] = await Promise.all([
    getOpenListings(filters),
    getOpenListings(), // for the district options
    getReferencePrices(),
  ]);
  const districts = [...new Set(allOpen.map((l) => l.district))].sort();
  const filtered = Boolean(filters.district || filters.grade || filters.readyBy);

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh seconds={3} />
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold">Market</h1>
        <RefPriceStrip prices={prices} />
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3" aria-label="Filter listings">
        <label className="flex flex-col gap-1 text-sm">
          District
          <select name="district" defaultValue={filters.district ?? ''} className={selectClass}>
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Expected grade
          <select name="grade" defaultValue={filters.grade ?? ''} className={selectClass}>
            <option value="">Any grade</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Ready by
          <input type="date" name="readyBy" defaultValue={filters.readyBy ?? ''} className={selectClass} />
        </label>
        <button
          type="submit"
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Filter
        </button>
        {filtered && (
          <Link href="/market" className="h-10 px-2 text-sm leading-10 text-primary underline-offset-4 hover:underline">
            Clear filters
          </Link>
        )}
      </form>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No open listings{filtered ? ' match these filters' : ''}.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
