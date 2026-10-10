// Pakka Sauda: F2-F7 sell wizard route. Owner: Workstream B. Server part only loads the reference prices.
import { SellWizard } from '@/components/farmer/SellWizard';
import { getReferencePrices } from '@/lib/queries';
import { requireUser } from '@/lib/session';

export default async function SellPage() {
  await requireUser('farmer');
  const referencePrices = await getReferencePrices();
  return <SellWizard referencePrices={referencePrices} />;
}
