// Pakka Sauda: marks every simulated money step. Owner: Workstream A. Real from Phase 0.
export function DemoBadge({ text = 'DEMO: no real money moves' }: { text?: string }) {
  return <span className="rounded bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-yellow-900">{text}</span>;
}
