// Pakka Sauda: wizard progress dots. Owner: Workstream B.
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-2 py-3" aria-label={`${current + 1} / ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-3 w-3 rounded-full ${i === current ? 'bg-[#15803d]' : i < current ? 'bg-green-300' : 'bg-stone-300'}`} />
      ))}
    </div>
  );
}
