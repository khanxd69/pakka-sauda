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
    if (!window.confirm(`Rule grade ${grade}? ${r?.outcome === 'payable' ? `The farmer will be paid ${formatRs(r.finalAmount)}.` : 'The sauda will be cancelled.'}`)) return;
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
    <form onSubmit={submit} className="flex flex-col rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Ruling</h2>
        <p className="text-[13px] text-ink-muted">Decide the grade from the evidence. The amount is recalculated by rule.</p>
      </div>
      <div className="flex flex-col gap-5 px-5 py-4">
        <fieldset className="grid grid-cols-3 gap-2">
          <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">Grade</legend>
          {GRADES.map((g) => (
            <label
              key={g}
              className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border px-3 py-2.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/30 ${
                grade === g ? 'border-brand bg-brand-soft' : 'border-line-strong hover:bg-subtle'
              }`}
            >
              <input type="radio" name="grade" value={g} checked={grade === g} onChange={() => setGrade(g)} className="sr-only" />
              <span className={`text-sm font-semibold ${grade === g ? 'text-brand' : 'text-ink'}`}>Grade {g}</span>
              <span className="text-[11px] tabular-nums text-ink-muted">{sauda.terms.price[g] == null ? 'Not accepted' : `Rs ${sauda.terms.price[g]}/kg`}</span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note" className="text-[13px] text-ink-muted">Note (required)</Label>
          <Textarea id="note" rows={3} maxLength={1000} required value={note} onChange={(e) => setNote(e.target.value)} placeholder="What the evidence shows" />
        </div>
        {r ? (
          r.outcome === 'payable' ? (
            <div className="flex flex-col gap-1 rounded-lg border border-brand/20 bg-brand-soft px-4 py-3">
              <span className="text-xs font-medium text-brand">New amount</span>
              <span className="text-2xl font-semibold tabular-nums text-ink">{formatRs(r.finalAmount)}</span>
              <span className="text-xs tabular-nums text-ink-muted">
                Was {was} · fee {formatRs(r.fee)}
              </span>
            </div>
          ) : (
            <p role="alert" className="rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-[13px] text-danger">
              Grade {r.grade} was not priced: the sauda is cancelled, the crop stays with the farmer and the token goes back to the buyer.
            </p>
          )
        ) : null}
      </div>
      <div className="flex flex-col gap-2 border-t border-line px-5 py-4">
        <Button type="submit" disabled={busy || !grade || !note.trim()} className="h-10 text-sm">
          {busy ? 'Saving…' : 'Submit ruling'}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={inconclusive} className="h-10 text-sm">
          Evidence inconclusive
        </Button>
      </div>
    </form>
  );
}
