// Pakka Sauda: dispute evidence side by side and the reviewer's ruling. Owner: Workstream D.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EvidenceCompare } from '@/components/admin/EvidenceCompare';
import { RulingForm } from '@/components/admin/RulingForm';
import { Timeline } from '@/components/buyer/Timeline';
import { Badge } from '@/components/ui/badge';
import { getEvidence, getSauda, getSaudaEvents } from '@/lib/queries';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import { requireUser } from '@/lib/session';

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser('admin');
  const sauda = /^[0-9a-f-]{36}$/i.test(id) ? await getSauda(id) : null;
  if (!sauda) notFound();
  const [events, evidence] = await Promise.all([getSaudaEvents(sauda.id), getEvidence(sauda.id)]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin" className="text-sm text-stone-500 hover:underline">
        ← Dashboard
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">
          Dispute: {sauda.farmer.name} ↔ {sauda.buyer.business_name ?? sauda.buyer.name}
        </h1>
        <Badge variant="outline">{STATUS_LABEL[sauda.status].en}</Badge>
      </div>
      <EvidenceCompare sauda={sauda} evidence={evidence} />
      <div className="grid gap-4 lg:grid-cols-2">
        {sauda.status === 'disputed' ? (
          <RulingForm sauda={sauda} />
        ) : (
          <p className="rounded-2xl border bg-white p-5 text-stone-600">
            This sauda is {STATUS_LABEL[sauda.status].en.toLowerCase()}; there is nothing to rule.
            {sauda.resolved_grade ? ` Ruled grade ${sauda.resolved_grade}: ${sauda.resolution_note}` : ''}
          </p>
        )}
        <Timeline events={events} sauda={sauda} />
      </div>
    </div>
  );
}
