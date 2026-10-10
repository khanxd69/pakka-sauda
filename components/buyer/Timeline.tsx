// Pakka Sauda: sauda event timeline (oldest first) from sauda_events. Owner: Workstream D.
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
    <section className="rounded-2xl border bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold">Timeline</h2>
      {events.length === 0 ? <p className="text-sm text-stone-500">No events yet.</p> : null}
      <ol className="flex flex-col gap-3 border-l-2 border-stone-200 pl-4">
        {events.map((e) => (
          <li key={e.id} className="relative text-sm">
            <span className="absolute -left-[1.4rem] top-1 h-3 w-3 rounded-full bg-green-600" aria-hidden />
            <div className="font-medium">{LABEL[e.type] ?? e.type}</div>
            <div className="text-stone-500">
              {when(e.created_at)} · {actor(e.actor_id)}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
