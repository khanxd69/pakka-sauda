'use client';
// Pakka Sauda: buyer records weighed kg + grade at the farm gate, with a live settle() preview. Owner: Workstream D.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { recordCollection } from '@/app/actions/saudas';
import { DemoBadge } from '@/components/shared/DemoBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatRs } from '@/lib/format';
import { isShortfall, settle } from '@/lib/settle';
import type { Grade, SaudaView } from '@/lib/types';
import { errorText } from './errors';

const GRADES: Grade[] = ['A', 'B', 'C'];

export function CollectionForm({ sauda }: { sauda: SaudaView }) {
  const router = useRouter();
  const [kg, setKg] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const weighedKg = Number(kg);
  const valid = kg.trim() !== '' && weighedKg > 0 && grade != null;
  const r = valid ? settle(sauda.terms, weighedKg, grade) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !grade) return;
    setBusy(true);
    const res = await recordCollection({ saudaId: sauda.id, weighedKg, grade, note: note.trim() || undefined });
    setBusy(false);
    if (res.ok) toast.success('Collection recorded');
    else toast.error(errorText(res.error));
    router.refresh();
  }

  const line = (label: string, value: React.ReactNode, strong = false) => (
    <div className={`flex justify-between gap-4 ${strong ? 'font-semibold' : ''}`}>
      <span className="text-stone-600">{label}</span>
      <span>{value}</span>
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border-2 border-green-300 bg-white p-5">
      <h2 className="text-lg font-semibold">Record collection</h2>
      {sauda.collection_code ? (
        <p className="rounded-lg bg-stone-100 p-2 text-sm">
          Farmer&apos;s code: <span className="font-mono text-base font-bold">{sauda.collection_code}</span> (must appear in your photo, P1)
        </p>
      ) : null}
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-1">
          <Label htmlFor="kg">Weighed kg</Label>
          <Input id="kg" type="number" inputMode="numeric" min={1} value={kg} onChange={(e) => setKg(e.target.value)} className="w-40" required />
        </div>
        <fieldset className="flex flex-col gap-1">
          <legend className="text-sm font-medium">Grade</legend>
          <div className="flex gap-4 pt-2">
            {GRADES.map((g) => (
              <label key={g} className="flex items-center gap-2">
                <input type="radio" name="grade" value={g} checked={grade === g} onChange={() => setGrade(g)} className="h-4 w-4" />
                {g} <span className="text-xs text-stone-500">({sauda.terms.price[g] == null ? 'not priced' : `Rs ${sauda.terms.price[g]}/kg`})</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {r?.outcome === 'payable' ? (
        <div className="flex flex-col gap-1 rounded-xl bg-stone-50 p-3 text-sm">
          {line('Price', `${formatRs(r.pricePerKg)}/kg (grade ${r.grade})`)}
          {line('Total to farmer', formatRs(r.finalAmount), true)}
          {line('Token already paid', <span className="flex items-center gap-2">{formatRs(r.tokenAmount)} <DemoBadge /></span>)}
          {r.balanceAtLoading >= 0
            ? line('Balance at loading', formatRs(r.balanceAtLoading), true)
            : line('Farmer refunds', formatRs(-r.balanceAtLoading), true)}
          {line(`Platform fee (${sauda.terms.fee_percent}%)`, formatRs(r.fee))}
          {line('You pay in total', formatRs(r.buyerPays), true)}
        </div>
      ) : null}
      {r?.outcome === 'grade_not_accepted' ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          You did not price grade {r.grade}: submitting records the grade; if the farmer agrees, the sauda is cancelled and your token is
          returned.
        </p>
      ) : null}
      {valid && isShortfall(sauda.terms, weighedKg) ? (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Below 80% of the low estimate: you may cancel after recording.</p>
      ) : null}

      <Button type="submit" disabled={!valid || busy} className="h-11 bg-green-700 text-base text-white hover:bg-green-800">
        {busy ? 'Saving…' : 'Submit collection'}
      </Button>
    </form>
  );
}
