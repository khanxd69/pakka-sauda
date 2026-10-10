// Pakka Sauda: buyer's claim vs farmer's claim, side by side, with the facts a reviewer checks. Owner: Workstream D.
import { formatDate, formatKg } from '@/lib/format';
import type { Evidence, SaudaView } from '@/lib/types';

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });

function Photos({ items }: { items: Evidence[] }) {
  if (items.length === 0) return <p className="text-sm text-stone-500">No photos.</p>;
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((e) => (
        <a key={e.id} href={e.url} target="_blank" rel="noreferrer" className="flex flex-col gap-1 text-xs text-stone-600">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={e.url} alt={`${e.kind} photo`} className="aspect-square w-full rounded-lg object-cover" />
          {when(e.captured_at)}
          {e.lat != null && e.lng != null ? ` · ${e.lat.toFixed(4)}, ${e.lng.toFixed(4)}` : ' · no location'}
        </a>
      ))}
    </div>
  );
}

export function EvidenceCompare({ sauda, evidence }: { sauda: SaudaView; evidence: Evidence[] }) {
  const t = sauda.terms;
  const buyerPhotos = evidence.filter((e) => e.uploaded_by === sauda.wholesaler_id);
  const farmerPhotos = evidence.filter((e) => e.uploaded_by === sauda.farmer_id);
  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-2 rounded-2xl border bg-white p-5 text-sm sm:grid-cols-4">
        <div>
          <div className="text-stone-500">Expected grade at listing</div>
          <div className="font-semibold">{t.expected_grade}</div>
        </div>
        <div>
          <div className="text-stone-500">Ladder (Rs/kg)</div>
          <div className="font-semibold">
            A {t.price.A ?? '–'} · B {t.price.B ?? '–'} · C {t.price.C ?? '–'}
          </div>
        </div>
        <div>
          <div className="text-stone-500">Weight</div>
          <div className="font-semibold">{sauda.weighed_kg != null ? formatKg(sauda.weighed_kg) : '–'}</div>
        </div>
        <div>
          <div className="text-stone-500">Collection code</div>
          <div className="font-mono font-semibold">{sauda.collection_code ?? '–'}</div>
        </div>
        <div className="sm:col-span-4 text-stone-500">Collection date {formatDate(t.collection_date)}</div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-2 rounded-2xl border-2 border-sky-200 bg-white p-5">
          <h2 className="font-semibold">Buyer&apos;s claim · {sauda.buyer.business_name ?? sauda.buyer.name}</h2>
          <p>
            Grade recorded: <span className="text-xl font-bold">{sauda.delivered_grade}</span>
          </p>
          <p className="text-sm">Note: {sauda.buyer_note ?? '–'}</p>
          <Photos items={buyerPhotos} />
        </section>
        <section className="flex flex-col gap-2 rounded-2xl border-2 border-amber-200 bg-white p-5">
          <h2 className="font-semibold">Farmer&apos;s claim · {sauda.farmer.name}</h2>
          <p>
            Grade claimed: <span className="text-xl font-bold">{sauda.farmer_claimed_grade ?? '–'}</span>
          </p>
          <p className="text-sm">
            Reason: <span lang="ur">{sauda.dispute_reason ?? '–'}</span>
          </p>
          <Photos items={farmerPhotos} />
        </section>
      </div>
    </div>
  );
}
