// Pakka Sauda: wholesaler sauda detail: terms, timeline, status panel. Party check, else 404. Owner: Workstream D.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SaudaActions } from '@/components/buyer/SaudaActions';
import { SaudaTermsCard } from '@/components/buyer/SaudaTermsCard';
import { Timeline } from '@/components/buyer/Timeline';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { Badge } from '@/components/ui/badge';
import { getSauda, getSaudaEvents } from '@/lib/queries';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import { requireUser } from '@/lib/session';

export default async function SaudaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('wholesaler');
  const sauda = /^[0-9a-f-]{36}$/i.test(id) ? await getSauda(id) : null;
  if (!sauda || sauda.wholesaler_id !== user.id) notFound();
  const events = await getSaudaEvents(sauda.id);

  return (
    <div className="flex flex-col gap-4">
      <AutoRefresh />
      <Link href="/saudas" className="text-sm text-stone-500 hover:underline">
        ← My saudas
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Sauda with {sauda.farmer.name}</h1>
        <Badge variant="outline">{STATUS_LABEL[sauda.status].en}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SaudaActions sauda={sauda} />
          <SaudaTermsCard sauda={sauda} />
        </div>
        <Timeline events={events} sauda={sauda} />
      </div>
    </div>
  );
}
