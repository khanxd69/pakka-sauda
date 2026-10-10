// Pakka Sauda: farmer shell. Owner: Workstream B. Urdu, right to left, Nastaliq, audio first.
import { Noto_Nastaliq_Urdu } from 'next/font/google';
import { redirect } from 'next/navigation';
import { FarmerHeader } from '@/components/farmer/FarmerHeader';
import { getCurrentUser } from '@/lib/session';

const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400', '700'], display: 'swap' });

export default async function FarmerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'farmer') redirect('/');
  return (
    <div dir="rtl" lang="ur" className={`${nastaliq.className} min-h-dvh bg-stone-50 leading-[1.9] text-stone-900`}>
      <FarmerHeader nameUr={user.name_ur ?? user.name} />
      <main className="mx-auto w-full max-w-md px-4 pb-8">{children}</main>
    </div>
  );
}
