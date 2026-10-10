import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = { title: 'Pakka Sauda', description: 'Urdu voice-guided harvest marketplace (demo)' };
export const viewport: Viewport = { themeColor: '#166534', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh bg-page text-ink antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
