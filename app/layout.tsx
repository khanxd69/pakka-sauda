import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Nastaliq_Urdu } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
// Urdu text inside English dashboards (farmer names, his spoken words). Not preloaded: fetched only when used.
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400'], variable: '--font-nastaliq', display: 'swap', preload: false });

export const metadata: Metadata = { title: 'Pakka Sauda', description: 'Urdu voice-guided harvest marketplace (demo)' };
export const viewport: Viewport = { themeColor: '#166534', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${nastaliq.variable}`}>
      <body className="min-h-dvh bg-page text-ink antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
