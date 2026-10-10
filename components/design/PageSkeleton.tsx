// Pakka Sauda design system: loading placeholders for dashboard and farmer pages.
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48 bg-line" />
        <Skeleton className="h-4 w-80 max-w-full bg-line/70" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-line/70" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl bg-line/60" />
    </div>
  );
}

export function FarmerSkeleton() {
  return (
    <div className="flex flex-col gap-4 pt-5" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 flex-1 bg-line" />
        <Skeleton className="size-14 rounded-full bg-attn-soft" />
      </div>
      <Skeleton className="h-28 rounded-2xl bg-line/70" />
      <Skeleton className="h-24 rounded-2xl bg-line/60" />
      <Skeleton className="h-24 rounded-2xl bg-line/60" />
    </div>
  );
}
