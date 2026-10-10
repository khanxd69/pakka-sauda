// Pakka Sauda: wholesaler sauda detail: status, lifecycle, settlement, terms, timeline. Party check, else 404. Owner: D.
import { notFound } from 'next/navigation';
import { SaudaActions } from '@/components/buyer/SaudaActions';
import { SaudaTermsCard } from '@/components/buyer/SaudaTermsCard';
import { SettlementBreakdown } from '@/components/buyer/SettlementBreakdown';
import { Timeline } from '@/components/buyer/Timeline';
import { Card } from '@/components/design/Card';
import { PageHeader } from '@/components/design/PageHeader';
import { Stepper } from '@/components/design/Stepper';
import { StatusPill } from '@/components/design/StatusPill';
import { formatRs } from '@/lib/format';
import { getSauda, getSaudaEvents } from '@/lib/queries';
import { requireUser } from '@/lib/session';
import { settle } from '@/lib/settle';
import { AutoRefresh } from '@/components/shared/AutoRefresh';

export default async function SaudaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('wholesaler');
  const sauda = /^[0-9a-f-]{36}$/i.test(id) ? await getSauda(id) : null;
  if (!sauda || sauda.wholesaler_id !== user.id) notFound();
  const events = await getSaudaEvents(sauda.id);
  const grade = sauda.resolved_grade ?? sauda.delivered_grade;
  const r = sauda.weighed_kg != null && grade ? settle(sauda.terms, sauda.weighed_kg, grade) : null;

  return (
    <>
      <AutoRefresh />
      <PageHeader
        back={{ href: '/saudas', label: 'My saudas' }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Sauda with {sauda.farmer.name}
            <StatusPill kind="sauda" status={sauda.status} />
          </span>
        }
        description={sauda.final_amount != null ? `Final amount ${formatRs(sauda.final_amount)}` : `Token ${formatRs(sauda.terms.token_amount)} · ${sauda.listing.district}`}
      />
      <div className="flex flex-col gap-4">
        <Card bodyClassName="px-5 py-5">
          <Stepper status={sauda.status} />
        </Card>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_380px]">
          <div className="flex min-w-0 flex-col gap-4">
            <SaudaActions sauda={sauda} />
            {r ? <SettlementBreakdown r={r} /> : null}
            <SaudaTermsCard sauda={sauda} />
          </div>
          <div className="min-w-0 lg:sticky lg:top-24">
            <Timeline events={events} sauda={sauda} />
          </div>
        </div>
      </div>
    </>
  );
}
