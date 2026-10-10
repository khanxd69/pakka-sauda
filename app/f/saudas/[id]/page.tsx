// Pakka Sauda: F9 sauda card for the farmer. Owner: Workstream B. Party check, then terms + status panel.
import { notFound } from 'next/navigation';
import { SaudaPanel } from '@/components/farmer/SaudaPanel';
import { SaudaTerms } from '@/components/farmer/SaudaTerms';
import { ScreenTitle } from '@/components/farmer/ScreenTitle';
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
      <ScreenTitle>{STATUS_LABEL[sauda.status].ur}</ScreenTitle>
      <div className="flex flex-col gap-4">
        <SaudaPanel sauda={sauda} />
        <SaudaTerms sauda={sauda} />
      </div>
    </>
  );
}
