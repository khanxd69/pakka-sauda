// Pakka Sauda: buyer's claim vs farmer's claim, side by side, with the facts a reviewer checks. Owner: Workstream D.
import { Camera, Clock, KeyRound, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { KeyValueList } from '@/components/design/KeyValueList';
import { Pill, type Tone } from '@/components/design/Pill';
import { formatDate, formatKg, formatRs } from '@/lib/format';
import type { Evidence, Grade, SaudaView } from '@/lib/types';

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });
const GRADE_TONE: Record<Grade, Tone> = { A: 'success', B: 'warning', C: 'danger' };
const GRADES: Grade[] = ['A', 'B', 'C'];

/** Great-circle distance in km (haversine). */
function km(a: Evidence, b: Evidence): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat! - a.lat!);
  const dLng = rad(b.lng! - a.lng!);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat!)) * Math.cos(rad(b.lat!)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function Photos({ items }: { items: Evidence[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-subtle text-[13px] text-ink-muted">
        <Camera className="size-5" strokeWidth={1.5} aria-hidden />
        No photos
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((e) => (
        <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={e.url} alt={`${e.kind} photo`} className="aspect-[4/3] w-full bg-subtle object-cover transition-opacity group-hover:opacity-90" />
          <span className="flex flex-col gap-1 border-t border-line px-3 py-2 text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" strokeWidth={1.5} aria-hidden />
              {when(e.captured_at)} (server time)
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MapPin className="size-3" strokeWidth={1.5} aria-hidden />
              {e.lat != null && e.lng != null ? `${e.lat.toFixed(4)}, ${e.lng.toFixed(4)}` : 'No location'}
            </span>
          </span>
        </a>
      ))}
    </div>
  );
}

function Side({ title, who, grade, children, photos }: { title: string; who: string; grade: Grade | null; children: ReactNode; photos: Evidence[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</span>
          <span className="text-base font-semibold text-ink">{who}</span>
        </div>
        {grade ? (
          <Pill tone={GRADE_TONE[grade]} className="text-sm">
            Grade {grade}
          </Pill>
        ) : (
          <Pill>No grade</Pill>
        )}
      </div>
      {children}
      <Photos items={photos} />
    </section>
  );
}

export function EvidenceCompare({ sauda, evidence }: { sauda: SaudaView; evidence: Evidence[] }) {
  const t = sauda.terms;
  const buyerPhotos = evidence.filter((e) => e.uploaded_by === sauda.wholesaler_id);
  const farmerPhotos = evidence.filter((e) => e.uploaded_by === sauda.farmer_id);
  const bLoc = buyerPhotos.find((e) => e.lat != null && e.lng != null);
  const fLoc = farmerPhotos.find((e) => e.lat != null && e.lng != null);
  const distance = bLoc && fLoc ? km(bLoc, fLoc) : null;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-surface p-5 shadow-card md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">Agreed price ladder (Rs/kg)</span>
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-line">
            {GRADES.map((g) => {
              const marks = [sauda.delivered_grade === g ? 'buyer' : null, sauda.farmer_claimed_grade === g ? 'farmer' : null].filter(Boolean);
              return (
                <div key={g} className={`flex flex-col gap-1 border-e border-line p-3 last:border-e-0 ${marks.length ? 'bg-subtle' : ''}`}>
                  <span className="text-xs text-ink-muted">Grade {g}</span>
                  <span className="text-lg font-semibold tabular-nums text-ink">{t.price[g] == null ? '—' : formatRs(t.price[g]!)}</span>
                  <span className="text-[11px] text-ink-muted">{marks.length ? `Claimed by ${marks.join(' & ')}` : t.price[g] == null ? 'Not accepted' : ' '}</span>
                </div>
              );
            })}
          </div>
        </div>
        <KeyValueList
          items={[
            { label: 'Expected grade at listing', value: t.expected_grade },
            { label: 'Weight recorded', value: sauda.weighed_kg != null ? formatKg(sauda.weighed_kg) : '—', numeric: true },
            {
              label: 'Collection code',
              value: (
                <span className="inline-flex items-center gap-1.5 font-mono font-semibold tracking-widest">
                  <KeyRound className="size-3.5 text-ink-muted" strokeWidth={1.5} aria-hidden />
                  {sauda.collection_code ?? '—'}
                </span>
              ),
            },
            { label: 'Collection date', value: formatDate(t.collection_date) },
          ]}
        />
        {distance != null || sauda.collection_code ? (
          <p className="text-[13px] text-ink-muted md:col-span-2">
            {sauda.collection_code ? `Check that code ${sauda.collection_code} is visible in the buyer's photo.` : ''}
            {distance != null ? ` Buyer and farmer photos were taken ${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} apart.` : ''}
          </p>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Side title="Buyer's claim" who={sauda.buyer.business_name ?? sauda.buyer.name} grade={sauda.delivered_grade} photos={buyerPhotos}>
          <p className="text-sm text-ink">
            <span className="text-ink-muted">Note: </span>
            {sauda.buyer_note ?? '—'}
          </p>
        </Side>
        <Side title="Farmer's claim" who={sauda.farmer.name} grade={sauda.farmer_claimed_grade} photos={farmerPhotos}>
          <p className="text-sm text-ink">
            <span className="text-ink-muted">Reason: </span>
            <span lang="ur" className="font-urdu">
              {sauda.dispute_reason ?? '—'}
            </span>
          </p>
        </Side>
      </div>
    </div>
  );
}
