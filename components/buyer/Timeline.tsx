// Pakka Sauda: sauda event timeline (oldest first) from sauda_events. Owner: Workstream D.
import { Card } from '@/components/design/Card';
import { Timeline as TimelineList } from '@/components/design/Timeline';
import type { SaudaEvent, SaudaView } from '@/lib/types';

const LABEL: Record<string, string> = {
  created: 'Bid accepted, sauda created',
  token_paid: 'Token paid (DEMO)',
  collected: 'Collection recorded',
  confirmed: 'Farmer confirmed',
  disputed: 'Farmer disputed the grade',
  resolved: 'Reviewer ruled',
  balance_received: 'Farmer confirmed balance received',
  cancelled: 'Cancelled',
};

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' });

export function Timeline({ events, sauda }: { events: SaudaEvent[]; sauda: SaudaView }) {
  const actor = (id: string | null) =>
    id == null ? 'System' : id === sauda.farmer_id ? sauda.farmer.name : id === sauda.wholesaler_id ? (sauda.buyer.business_name ?? sauda.buyer.name) : 'Reviewer';
  return (
    <Card title="Timeline" description="Every change is recorded">
      {events.length === 0 ? (
        <p className="text-sm text-ink-muted">No events yet.</p>
      ) : (
        <TimelineList
          items={events.map((e) => ({
            id: e.id,
            title: LABEL[e.type] ?? e.type,
            meta: `${when(e.created_at)} · ${actor(e.actor_id)}`,
            tone: e.type === 'disputed' || e.type === 'cancelled' ? 'danger' : 'brand',
          }))}
        />
      )}
    </Card>
  );
}
