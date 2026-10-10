// Pakka Sauda: wholesaler app shell: sidebar (Market, My bids, My saudas), user, switch user. Owner: Workstream D.
import { Gavel, Handshake, LayoutGrid } from 'lucide-react';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/design/AppShell';
import { getCurrentUser } from '@/lib/session';

const NAV = [
  { href: '/market', label: 'Market', icon: <LayoutGrid strokeWidth={1.5} /> },
  { href: '/bids', label: 'My bids', icon: <Gavel strokeWidth={1.5} /> },
  { href: '/saudas', label: 'My saudas', icon: <Handshake strokeWidth={1.5} /> },
];

export async function BuyerShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'wholesaler') redirect('/');
  return (
    <AppShell nav={NAV} home="/market" area="Wholesaler" user={{ name: user.business_name ?? user.name, sub: user.name, verified: user.verified }}>
      {children}
    </AppShell>
  );
}
