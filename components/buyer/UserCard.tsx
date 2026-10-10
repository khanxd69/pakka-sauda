// Pakka Sauda: one big "sign in as" card on the choose-user page. Owner: Workstream D.
// The tap also unlocks audio autoplay for the farmer screens in this tab.
import { setDemoUser } from '@/app/actions/session';
import type { Profile } from '@/lib/types';

export function UserCard({ profile }: { profile: Profile }) {
  const title = profile.business_name ?? profile.name;
  return (
    <form action={setDemoUser.bind(null, profile.id)}>
      <button
        type="submit"
        className="flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-green-600 hover:shadow-md active:scale-[0.99]"
      >
        <span className="flex flex-col">
          <span className="text-xl font-semibold">
            {title} {profile.verified && profile.role === 'wholesaler' ? <span className="text-green-700">✓</span> : null}
          </span>
          <span className="text-sm text-stone-500">
            {profile.role === 'wholesaler' ? `${profile.name} · ` : ''}
            {profile.district ?? 'Pakka Sauda'}
            {profile.role === 'wholesaler' && !profile.verified ? ' · unverified' : ''}
          </span>
        </span>
        {profile.name_ur ? (
          <span lang="ur" dir="rtl" className="text-2xl text-stone-700">
            {profile.name_ur}
          </span>
        ) : null}
      </button>
    </form>
  );
}
