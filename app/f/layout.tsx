// Pakka Sauda: farmer shell. Owner: Workstream B. Urdu, right to left, Nastaliq, audio first.
import { Noto_Nastaliq_Urdu } from 'next/font/google';
import { redirect } from 'next/navigation';
import { FarmerHeader } from '@/components/farmer/FarmerHeader';
import { OfflineBanner } from '@/components/farmer/OfflineBanner';
import { getCurrentUser } from '@/lib/session';

const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400', '700'], variable: '--font-nastaliq', display: 'swap' });

export default async function FarmerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'farmer') redirect('/');
  return (
    <div dir="rtl" lang="ur" className={`${nastaliq.variable} ${nastaliq.className} min-h-dvh bg-page leading-[1.9] text-ink`}>
      <FarmerHeader nameUr={user.name_ur ?? user.name} />
      <OfflineBanner />
      <main className="mx-auto w-full max-w-md px-4 pb-6">{children}</main>
    </div>
  );
}
