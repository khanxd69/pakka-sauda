// Pakka Sauda: one demo identity on the choose-user screen (D1.1). Server component.
// The whole card is a submit button so the tap target is large; the tap also unlocks audio autoplay for farmers.
import { setDemoUser } from '@/app/actions/session';
import type { Profile } from '@/lib/types';

export function UserCard({ profile }: { profile: Profile }) {
  const title = profile.business_name ?? profile.name;
  const subtitle = profile.business_name ? profile.name : null;

  return (
    <form action={setDemoUser.bind(null, profile.id)}>
      <button
        type="submit"
        className="flex min-h-24 w-full flex-col items-start gap-1 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex items-center gap-2 text-lg font-semibold">
          {title}
          {profile.role === 'wholesaler' &&
            (profile.verified ? (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">✓ Verified</span>
            ) : (
              <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">Unverified</span>
            ))}
        </span>
        <span className="text-sm text-muted-foreground">
          {[subtitle, profile.district].filter(Boolean).join(' · ') || 'Neutral reviewer'}
        </span>
        {profile.name_ur && (
          <span lang="ur" dir="rtl" className="text-base">
            {profile.name_ur}
          </span>
        )}
      </button>
    </form>
  );
}
