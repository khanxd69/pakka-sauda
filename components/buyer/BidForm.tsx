'use client';
// Pakka Sauda: the grade-price ladder bid form with a live preview and client-side rule check. Owner: Workstream D.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { placeBid } from '@/app/actions/bids';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  const gradeRow = (g: 'B' | 'C', value: string, set: (v: string) => void, off: boolean, setOff: (v: boolean) => void) => (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`price-${g}`}>Grade {g} (Rs/kg)</Label>
      <div className="flex items-center gap-3">
        <Input id={`price-${g}`} type="number" inputMode="decimal" min={0} step="0.5" value={off ? '' : value} disabled={off} onChange={(e) => set(e.target.value)} className="w-32" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={off} onChange={(e) => setOff(e.target.checked)} className="h-4 w-4" />
          Don&apos;t accept {g}
        </label>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border bg-white p-5">
      <h2 className="text-lg font-semibold">{isUpdate ? 'Update your bid' : 'Place a bid'}</h2>
      <div className="flex flex-col gap-1">
        <Label htmlFor="price-A">Grade A (Rs/kg) *</Label>
        <Input id="price-A" type="number" inputMode="decimal" min={0} step="0.5" value={a} onChange={(e) => setA(e.target.value)} className="w-32" required />
      </div>
      {gradeRow('B', b, setB, noB, setNoB)}
      {gradeRow('C', c, setC, noC, setNoC)}
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-1">
          <Label htmlFor="date">Collection date</Label>
          <Input id="date" type="date" value={date} min={listing.ready_from} onChange={(e) => setDate(e.target.value)} className="w-44" />
        </div>
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium">Loading paid by</legend>
          <div className="flex gap-4 pt-2 text-sm">
            {(['buyer', 'farmer'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 capitalize">
                <input type="radio" name="loading" value={v} checked={loading === v} onChange={() => setLoading(v)} className="h-4 w-4" />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>

      {priceA != null && priceA > 0 ? <BidPreviewTable preview={bidPreview(listing, prices)} feePercent={CONFIG.FEE_PERCENT} /> : null}

      {ruleError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{BID_ERROR_TEXT[ruleError]}</p> : null}
      {serverError && !ruleError ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{serverError}</p> : null}

      <Button type="submit" disabled={busy || missing || !!ruleError} className="h-11 bg-green-700 text-base text-white hover:bg-green-800">
        {busy ? 'Saving…' : isUpdate ? 'Update bid' : 'Place bid'}
      </Button>
    </form>
  );
}
