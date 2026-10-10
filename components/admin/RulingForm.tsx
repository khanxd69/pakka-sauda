'use client';
// Pakka Sauda: the reviewer's ruling: grade + required note, with a settle() preview of the new amount. Owner: D.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { resolveDispute } from '@/app/actions/admin';
import { cancelSauda } from '@/app/actions/saudas';
import { errorText } from '@/components/buyer/errors';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatRs } from '@/lib/format';
import { settle } from '@/lib/settle';
import type { Grade, SaudaView } from '@/lib/types';

const GRADES: Grade[] = ['A', 'B', 'C'];

export function RulingForm({ sauda }: { sauda: SaudaView }) {
  const router = useRouter();
  const [grade, setGrade] = useState<Grade | null>(sauda.farmer_claimed_grade);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const r = grade && sauda.weighed_kg != null ? settle(sauda.terms, sauda.weighed_kg, grade) : null;
  const was = sauda.final_amount != null ? formatRs(sauda.final_amount) : 'not payable (grade not priced)';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!grade || !note.trim()) return;
    setBusy(true);
    const res = await resolveDispute({ saudaId: sauda.id, grade, note: note.trim() });
    setBusy(false);
    if (res.ok) {
      toast.success(res.data.status === 'agreed' ? 'Ruling saved: agreed' : 'Ruling saved: cancelled, token returned to buyer');
      router.push('/admin');
    } else {
      toast.error(errorText(res.error));
      router.refresh();
    }
  }

  async function inconclusive() {
    if (!window.confirm('Evidence inconclusive? The sauda is cancelled, the crop stays with the farmer and the token goes back to the buyer.')) return;
    setBusy(true);
    const res = await cancelSauda({ saudaId: sauda.id, reason: 'dispute_unresolved' });
    setBusy(false);
    if (res.ok) {
      toast.success('Cancelled: dispute unresolved');
      router.push('/admin');
    } else {
      toast.error(errorText(res.error));
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border-2 border-stone-300 bg-white p-5">
      <h2 className="text-lg font-semibold">Ruling</h2>
      <fieldset className="flex gap-6">
        <legend className="mb-1 text-sm font-medium">Grade</legend>
        {GRADES.map((g) => (
          <label key={g} className="flex items-center gap-2">
            <input type="radio" name="grade" value={g} checked={grade === g} onChange={() => setGrade(g)} className="h-4 w-4" />
            {g}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-1">
        <Label htmlFor="note">Note (required)</Label>
        <Textarea id="note" rows={3} maxLength={1000} required value={note} onChange={(e) => setNote(e.target.value)} placeholder="What the evidence shows" />
      </div>
      {r ? (
        <p className={`rounded-lg p-3 text-sm ${r.outcome === 'payable' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-800'}`}>
          {r.outcome === 'payable'
            ? `New amount ${formatRs(r.finalAmount)}, was ${was}. Fee ${formatRs(r.fee)}.`
            : `Grade ${r.grade} was not priced: the sauda is cancelled, the crop stays with the farmer and the token goes back to the buyer.`}
        </p>
      ) : null}
      <Button type="submit" disabled={busy || !grade || !note.trim()} className="h-11 bg-stone-900 text-base text-white">
        {busy ? 'Saving…' : 'Submit ruling'}
      </Button>
      <Button type="button" variant="outline" disabled={busy} onClick={inconclusive}>
        Evidence inconclusive
      </Button>
    </form>
  );
}
