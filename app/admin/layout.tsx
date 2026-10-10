// Pakka Sauda: reviewer (admin) layout. Owner: Workstream D.
import { AlertTriangle, LayoutDashboard, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { ResetDemoButton } from '@/components/admin/ResetDemoButton';
import { AppShell } from '@/components/design/AppShell';
import { CONFIG } from '@/lib/config';
import { getCurrentUser } from '@/lib/session';

const NAV = [
  { href: '/admin', label: 'Overview', icon: <LayoutDashboard strokeWidth={1.5} />, exact: true },
  { href: '/admin/disputes', label: 'Disputes', icon: <AlertTriangle strokeWidth={1.5} /> },
  { href: '/admin/users', label: 'Users', icon: <Users strokeWidth={1.5} /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/');
  return (
    <AppShell nav={NAV} home="/admin" area="Reviewer" user={{ name: user.name, sub: 'Neutral reviewer' }} sidebarFooter={CONFIG.DEMO_MODE ? <ResetDemoButton /> : null}>
      {children}
    </AppShell>
  );
}
