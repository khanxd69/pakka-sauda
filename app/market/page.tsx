// Pakka Sauda: wholesaler market: filter bar, reference prices, listings table (cards on mobile). Owner: Workstream D.
import Link from 'next/link';
import { Filter, Sprout } from 'lucide-react';
import { ListingCard } from '@/components/buyer/ListingCard';
import { RefPriceStrip } from '@/components/buyer/RefPriceStrip';
import { EmptyState } from '@/components/design/EmptyState';
import { PageHeader } from '@/components/design/PageHeader';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getOpenListings, getReferencePrices } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import type { Grade } from '@/lib/types';

type SP = Promise<{ district?: string; grade?: string; readyBy?: string }>;

const control =
  'h-11 min-w-0 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20';

export default async function MarketPage({ searchParams }: { searchParams: SP }) {
  await requireUser('wholesaler');
  const sp = await searchParams;
  const grade = sp.grade === 'A' || sp.grade === 'B' || sp.grade === 'C' ? (sp.grade as Grade) : undefined;
  const readyBy = sp.readyBy && /^\d{4}-\d{2}-\d{2}$/.test(sp.readyBy) ? sp.readyBy : undefined;
  const district = sp.district || undefined;
  const [listings, prices] = await Promise.all([getOpenListings({ district, grade, readyBy }), getReferencePrices()]);
  const filtered = Boolean(district || grade || readyBy);

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Market" description="Open potato listings declared by farmers. Bid a price for each grade." />
      <div className="flex flex-col gap-4">
        <section className="mb-2 flex items-center gap-5 rounded-2xl border border-brand/15 bg-brand-soft px-5 py-6 sm:px-7"><span className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-surface text-brand sm:flex"><Sprout className="size-7" aria-hidden /></span><div><p className="text-xs font-semibold uppercase tracking-wider text-brand">From the field, to your business</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Your next harvest starts here.</h2><p className="mt-2 text-sm leading-relaxed text-ink-muted">Browse available crops and agree on a price for every grade before collection.</p></div></section>
        <RefPriceStrip prices={prices} />

        <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
          <label className="flex min-w-0 flex-1 basis-36 flex-col gap-2 text-xs font-medium text-ink-muted">
            District
            <select name="district" defaultValue={district ?? ''} className={control}>
              <option value="">All districts</option>
              <option value="Okara">Okara</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-36 flex-col gap-2 text-xs font-medium text-ink-muted">
            Expected grade
            <select name="grade" defaultValue={grade ?? ''} className={control}>
              <option value="">Any grade</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-1 basis-40 flex-col gap-2 text-xs font-medium text-ink-muted">
            Ready by
            <input type="date" name="readyBy" defaultValue={readyBy ?? ''} className={control} />
          </label>
          <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-hover">
            <Filter className="size-4" strokeWidth={1.5} aria-hidden />
            Apply
          </button>
          {filtered ? (
            <Link href="/market" className="inline-flex h-9 items-center px-2 text-sm text-ink-muted hover:text-ink">
              Clear
            </Link>
          ) : null}
          <span className="ms-auto self-center text-[13px] tabular-nums text-ink-muted">
            {listings.length} listing{listings.length === 1 ? '' : 's'}
          </span>
        </form>

        {listings.length === 0 ? (
          <EmptyState icon={<Sprout strokeWidth={1.5} />} title="No open listings match" description="Try clearing the filters. New listings appear here automatically." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
