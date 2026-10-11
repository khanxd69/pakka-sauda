// Pakka Sauda: one "sign in as" row on the choose-user page. Owner: Workstream D.
// The tap also unlocks audio autoplay for the farmer screens in this tab.
import { ChevronRight } from 'lucide-react';
import { setDemoUser } from '@/app/actions/session';
import { Avatar } from '@/components/design/Avatar';
import { Pill } from '@/components/design/Pill';
import type { Profile } from '@/lib/types';

export function UserCard({ profile }: { profile: Profile }) {
  const title = profile.business_name ?? profile.name;
  const sub =
    profile.role === 'wholesaler'
      ? `${profile.name} · ${profile.district ?? ''}`
      : profile.role === 'farmer'
        ? (profile.district ?? '')
        : 'Neutral dispute reviewer';
  return (
    <form action={setDemoUser.bind(null, profile.id)}>
      <button
        type="submit"
        className="group flex min-h-16 w-full flex-wrap items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors duration-150 hover:bg-brand-soft"
      >
        <Avatar name={title} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-ink">
            {title}
            {profile.name_ur ? (
              <span lang="ur" dir="rtl" className="font-urdu text-xs font-normal text-ink-muted">
                {profile.name_ur}
              </span>
            ) : null}
          </span>
          <span className="truncate text-xs text-ink-muted">{sub}</span>
        </span>
        {profile.role === 'wholesaler' ? (
          profile.verified ? (
            <Pill tone="success" dot>
              Verified
            </Pill>
          ) : (
            <Pill>Unverified</Pill>
          )
        ) : null}
        <ChevronRight className="size-4 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden />
      </button>
    </form>
  );
}
