'use client';
// Pakka Sauda: buyer records weighed kg + grade at the farm gate, with a live settle() preview. Owner: Workstream D.
import { AlertTriangle, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { uploadEvidence } from '@/app/actions/evidence';
import { recordCollection } from '@/app/actions/saudas';
import { KeyValueList } from '@/components/design/KeyValueList';
import { MoneyCell } from '@/components/design/MoneyCell';
import { CameraCapture } from '@/components/media/CameraCapture';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatRs } from '@/lib/format';
import { isShortfall, settle } from '@/lib/settle';
import type { Grade, SaudaView } from '@/lib/types';
import { errorText } from './errors';

const GRADES: Grade[] = ['A', 'B', 'C'];
const field =
  'h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm tabular-nums text-ink transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20';

export function CollectionForm({ sauda }: { sauda: SaudaView }) {
  const router = useRouter();
  const [kg, setKg] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<{ file: File; coords: { lat: number; lng: number } | null } | null>(null);
  const [skipPhoto, setSkipPhoto] = useState(false);
  const weighedKg = Number(kg);
  const valid = kg.trim() !== '' && weighedKg > 0 && grade != null && (photo != null || skipPhoto);
  const r = kg.trim() !== '' && weighedKg > 0 && grade != null ? settle(sauda.terms, weighedKg, grade) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !grade) return;
    setBusy(true);
    if (photo) {
      const form = new FormData();
      form.set('saudaId', sauda.id);
      form.set('kind', 'collection');
      form.set('file', photo.file);
      if (photo.coords) {
        form.set('lat', String(photo.coords.lat));
        form.set('lng', String(photo.coords.lng));
      }
      const up = await uploadEvidence(form);
      if (!up.ok) {
        setBusy(false);
        toast.error(`Photo upload failed: ${errorText(up.error)}`);
        return;
      }
    }
    const res = await recordCollection({ saudaId: sauda.id, weighedKg, grade, note: note.trim() || undefined });
    setBusy(false);
    if (res.ok) toast.success('Collection recorded');
    else toast.error(errorText(res.error));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Record collection</h2>
          <p className="text-[13px] text-ink-muted">Weigh at the farm gate and record the grade you see.</p>
        </div>
        {sauda.collection_code ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-1.5 text-[13px] text-ink-muted">
            <KeyRound className="size-4" strokeWidth={1.5} aria-hidden />
            Farmer&apos;s code
            <span className="font-mono text-base font-semibold tracking-widest text-ink">{sauda.collection_code}</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-5 px-5 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kg" className="text-[13px] text-ink-muted">Weighed kg</Label>
            <div className="relative">
              <input id="kg" type="number" inputMode="numeric" min={1} value={kg} onChange={(e) => setKg(e.target.value)} className={`${field} pe-10`} required />
              <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-ink-muted">kg</span>
            </div>
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-[13px] text-ink-muted">Grade recorded</legend>
            <div className="grid grid-cols-3 rounded-lg border border-line-strong p-0.5">
              {GRADES.map((g) => (
                <label
                  key={g}
                  className={`flex h-9 cursor-pointer flex-col items-center justify-center rounded-md text-sm leading-tight transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/30 ${
                    grade === g ? 'bg-brand-soft font-medium text-brand' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <input type="radio" name="grade" value={g} checked={grade === g} onChange={() => setGrade(g)} className="sr-only" />
                  <span>{g}</span>
                  <span className="text-[10px] tabular-nums">{sauda.terms.price[g] == null ? 'not priced' : `Rs ${sauda.terms.price[g]}/kg`}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="note" className="text-[13px] text-ink-muted">Note (optional)</Label>
          <Textarea id="note" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-ink-muted">Evidence photo</span>
          <CameraCapture
            hint={`Photo must show the farmer's code ${sauda.collection_code ?? ''} on his phone and 3 opened sample bags`}
            onCapture={(file, coords) => setPhoto({ file, coords })}
          />
          {photo ? (
            <p className="text-xs text-ink-muted">Photo ready{photo.coords ? ' with location' : ' (no location)'}.</p>
          ) : (
            <label className="flex items-center gap-2 text-[13px] text-warning">
              <input type="checkbox" checked={skipPhoto} onChange={(e) => setSkipPhoto(e.target.checked)} className="size-4 accent-brand" />
              Skip photo (demo only): the reviewer will have no evidence from you.
            </label>
          )}
        </div>

        {r?.outcome === 'payable' ? (
          <div className="rounded-lg border border-line bg-subtle/60 p-3">
            <KeyValueList
              items={[
                { label: 'Price', value: `${formatRs(r.pricePerKg)}/kg (grade ${r.grade})`, numeric: true },
                { label: 'Total to farmer', value: formatRs(r.finalAmount), numeric: true, strong: true },
                { label: 'Token already paid', value: <MoneyCell amount={r.tokenAmount} demo />, numeric: true },
                r.balanceAtLoading >= 0
                  ? { label: 'Balance at loading', value: formatRs(r.balanceAtLoading), numeric: true, strong: true }
                  : { label: 'Farmer refunds', value: formatRs(-r.balanceAtLoading), numeric: true, strong: true },
                { label: `Platform fee (${sauda.terms.fee_percent}%)`, value: formatRs(r.fee), numeric: true },
                { label: 'You pay in total', value: formatRs(r.buyerPays), numeric: true, strong: true },
              ]}
            />
          </div>
        ) : null}
        {r?.outcome === 'grade_not_accepted' ? (
          <p role="alert" className="flex gap-2 rounded-lg border border-danger/20 bg-danger-soft px-3 py-2 text-[13px] text-danger">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            You did not price grade {r.grade}: submitting records the grade; if the farmer agrees, the sauda is cancelled and your token is returned.
          </p>
        ) : null}
        {r && isShortfall(sauda.terms, weighedKg) ? (
          <p className="rounded-lg border border-warning/20 bg-warning-soft px-3 py-2 text-[13px] text-warning">
            Below 80% of the low estimate: you may cancel after recording.
          </p>
        ) : null}
      </div>

      <div className="border-t border-line px-5 py-4">
        <Button type="submit" disabled={!valid || busy} className="h-10 w-full text-sm">
          {busy ? 'Saving…' : 'Submit collection'}
        </Button>
      </div>
    </form>
  );
}
