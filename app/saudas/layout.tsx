// Pakka Sauda: wholesaler section layout. Owner: Workstream D.
import { BuyerShell } from '@/components/buyer/BuyerNav';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <BuyerShell>{children}</BuyerShell>;
}
