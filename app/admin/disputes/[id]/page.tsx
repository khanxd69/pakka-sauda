// Pakka Sauda: dispute evidence side by side and the reviewer's ruling. Owner: Workstream D.
import { notFound } from 'next/navigation';
import { EvidenceCompare } from '@/components/admin/EvidenceCompare';
import { RulingForm } from '@/components/admin/RulingForm';
import { Timeline } from '@/components/buyer/Timeline';
import { Card } from '@/components/design/Card';
import { PageHeader } from '@/components/design/PageHeader';
import { Stepper } from '@/components/design/Stepper';
import { StatusPill } from '@/components/design/StatusPill';
import { formatKg, formatRs } from '@/lib/format';
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
    <>
      <PageHeader
        back={{ href: '/admin/disputes', label: 'Disputes' }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {sauda.farmer.name} ↔ {sauda.buyer.business_name ?? sauda.buyer.name}
            <StatusPill kind="sauda" status={sauda.status} />
          </span>
        }
        description={[
          sauda.weighed_kg != null ? formatKg(sauda.weighed_kg) : null,
          sauda.delivered_grade ? `recorded grade ${sauda.delivered_grade}` : null,
          sauda.final_amount != null ? formatRs(sauda.final_amount) : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      />
      <div className="flex flex-col gap-4">
        <Card bodyClassName="px-5 py-5">
          <Stepper status={sauda.status} />
        </Card>
        <EvidenceCompare sauda={sauda} evidence={evidence} />
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {sauda.status === 'disputed' ? (
            <RulingForm sauda={sauda} />
          ) : (
            <Card title="Nothing to rule">
              <p className="text-sm text-ink-muted">
                This sauda is {STATUS_LABEL[sauda.status].en.toLowerCase()}.
                {sauda.resolved_grade ? ` Ruled grade ${sauda.resolved_grade}: ${sauda.resolution_note}` : ''}
              </p>
            </Card>
          )}
          <Timeline events={events} sauda={sauda} />
        </div>
      </div>
    </>
  );
}
