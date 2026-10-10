// Pakka Sauda: marks every simulated money step. Owner: Workstream A. Real from Phase 0.
export function DemoBadge({ text = 'DEMO: no real money moves' }: { text?: string }) {
  return (
    <span
      dir="ltr"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-attn-soft px-2 py-0.5 font-sans text-[11px] font-medium text-attn ring-1 ring-inset ring-attn/20"
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {text}
    </span>
  );
}
