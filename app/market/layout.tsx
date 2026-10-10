// Pakka Sauda: wholesaler section layout. Owner: Workstream D.
import { BuyerNav } from '@/components/buyer/BuyerNav';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone-50">
      <BuyerNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
