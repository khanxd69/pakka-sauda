// Pakka Sauda: F9-F11 sauda card for the farmer. Owner: Workstream B. Party check, then status, progress, panel, terms.
import { notFound } from 'next/navigation';
import { Stepper } from '@/components/design/Stepper';
import { SaudaPanel } from '@/components/farmer/SaudaPanel';
import { SaudaTerms } from '@/components/farmer/SaudaTerms';
import { AutoRefresh } from '@/components/shared/AutoRefresh';
import { getSauda } from '@/lib/queries';
import { STATUS_LABEL } from '@/lib/sauda-machine';
import { requireUser } from '@/lib/session';

export default async function FarmerSaudaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser('farmer');
  const sauda = /^[0-9a-f-]{36}$/i.test(id) ? await getSauda(id) : null;
  if (!sauda || sauda.farmer_id !== user.id) notFound();

  return (
    <>
      <AutoRefresh />
      <div className="flex flex-col gap-5 pt-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <h1 className="text-[28px] font-bold leading-[1.9] text-ink">{STATUS_LABEL[sauda.status].ur}</h1>
          <Stepper status={sauda.status} lang="ur" orientation="vertical" />
        </div>
        <SaudaPanel sauda={sauda} />
        <SaudaTerms sauda={sauda} />
      </div>
    </>
  );
}
