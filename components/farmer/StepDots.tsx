// Pakka Sauda: slim segmented progress bar for the sell wizard (F2-F7). Owner: Workstream B.
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex w-full gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-full transition-colors duration-150 ${i <= current ? 'bg-brand' : 'bg-line'}`} />
      ))}
    </div>
  );
}
