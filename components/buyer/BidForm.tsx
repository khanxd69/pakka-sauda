'use client';
// Pakka Sauda: the grade-price ladder bid form with a live preview and client-side rule check. Owner: Workstream D.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { placeBid } from '@/app/actions/bids';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CONFIG } from '@/lib/config';
import { BID_ERROR_TEXT, validateBid } from '@/lib/rules';
import { bidPreview } from '@/lib/settle';
import type { Bid, Grade, ListingView, LoadingPaidBy } from '@/lib/types';
import { BidPreviewTable } from './BidPreviewTable';
import { errorText } from './errors';

const num = (s: string): number | null => (s.trim() === '' || Number.isNaN(Number(s)) ? null : Number(s));

export function BidForm({ listing, existing }: { listing: ListingView; existing: Bid | null }) {
  const router = useRouter();
  const [a, setA] = useState(existing ? String(existing.price_a) : '');
  const [b, setB] = useState(existing?.price_b != null ? String(existing.price_b) : '');
  const [c, setC] = useState(existing?.price_c != null ? String(existing.price_c) : '');
  const [noB, setNoB] = useState(existing ? existing.price_b == null : false);
  const [noC, setNoC] = useState(existing ? existing.price_c == null : false);
  const [date, setDate] = useState(existing?.collection_date ?? listing.ready_from);
  const [loading, setLoading] = useState<LoadingPaidBy>(existing?.loading_paid_by ?? 'buyer');
  const [note, setNote] = useState(existing?.note ?? '');
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const priceA = num(a);
  const priceB = noB ? null : num(b);
  const priceC = noC ? null : num(c);
  const prices: Record<Grade, number | null> = { A: priceA, B: priceB, C: priceC };
  const missing = priceA == null || priceA <= 0 || (!noB && priceB == null) || (!noC && priceC == null);
  const ruleError = priceA == null ? null : validateBid(listing, { priceA, priceB, priceC, collectionDate: date });
  const isUpdate = existing?.status === 'pending';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (missing || ruleError || priceA == null) return;
    setBusy(true);
    setServerError(null);
    const res = await placeBid({
      listingId: listing.id,
      priceA,
      priceB,
      priceC,
      collectionDate: date,
      loadingPaidBy: loading,
      note: note.trim() || undefined,
    });
    setBusy(false);
    if (res.ok) {
      toast.success(isUpdate ? 'Bid updated' : 'Bid placed');
      router.refresh();
    } else {
      setServerError(errorText(res.error));
      toast.error(errorText(res.error));
    }
  }

  const field = 'h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm tabular-nums text-ink transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:bg-subtle disabled:text-ink-muted';
  const gradeRow = (g: 'A' | 'B' | 'C', value: string, set: (v: string) => void, off: boolean, setOff: ((v: boolean) => void) | null) => (
    <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
      <Label htmlFor={`price-${g}`} className="text-sm font-medium text-ink">
        {g}
        {g === listing.expected_grade ? <span className="ms-1 text-[10px] font-normal text-ink-muted">exp.</span> : null}
      </Label>
      <div className="relative">
        <input
          id={`price-${g}`}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.5"
          value={off ? '' : value}
          disabled={off}
          required={g === 'A'}
          placeholder={off ? 'Not accepted' : '0'}
          onChange={(e) => set(e.target.value)}
          className={`${field} pe-14`}
        />
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-ink-muted">Rs/kg</span>
      </div>
      {setOff ? (
        <label className="flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-muted">
          <input type="checkbox" checked={off} onChange={(e) => setOff(e.target.checked)} className="size-4 accent-brand" />
          Don&apos;t accept
        </label>
      ) : (
        <span className="text-[13px] text-ink-muted">Required</span>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-ink">{isUpdate ? 'Update your bid' : 'Place a bid'}</h2>
        <p className="text-[13px] text-ink-muted">Your price per kg for each grade. A lower grade may not pay more than a higher one.</p>
      </div>
      <div className="flex flex-col gap-5 px-5 py-4">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Grade price ladder</legend>
          {gradeRow('A', a, setA, false, null)}
          {gradeRow('B', b, setB, noB, setNoB)}
          {gradeRow('C', c, setC, noC, setNoC)}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date" className="text-[13px] text-ink-muted">Collection date</Label>
            <input id="date" type="date" value={date} min={listing.ready_from} onChange={(e) => setDate(e.target.value)} className={field} />
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-[13px] text-ink-muted">Loading paid by</legend>
            <div className="grid grid-cols-2 rounded-lg border border-line-strong p-0.5">
              {(['buyer', 'farmer'] as const).map((v) => (
                <label
                  key={v}
                  className={`flex h-8 cursor-pointer items-center justify-center rounded-md text-sm capitalize transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/30 ${
                    loading === v ? 'bg-brand-soft font-medium text-brand' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <input type="radio" name="loading" value={v} checked={loading === v} onChange={() => setLoading(v)} className="sr-only" />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note" className="text-[13px] text-ink-muted">Note (optional)</Label>
          <Textarea id="note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </div>

        {priceA != null && priceA > 0 ? <BidPreviewTable preview={bidPreview(listing, prices)} feePercent={CONFIG.FEE_PERCENT} /> : null}

        {ruleError ? (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {BID_ERROR_TEXT[ruleError]}
          </p>
        ) : null}
        {serverError && !ruleError ? (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {serverError}
          </p>
        ) : null}
      </div>
      <div className="border-t border-line px-5 py-4">
        <Button type="submit" disabled={busy || missing || !!ruleError} className="h-10 w-full text-sm">
          {busy ? 'Saving…' : isUpdate ? 'Update bid' : 'Place bid'}
        </Button>
      </div>
    </form>
  );
}
