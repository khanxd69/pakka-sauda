import { BuyerNav } from '@/components/buyer/BuyerNav';

export default function BidsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BuyerNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
