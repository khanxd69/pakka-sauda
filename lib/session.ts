// Pakka Sauda: demo "login". SERVER ONLY. Owner: Workstream A.
// The "choose user" screen sets two cookies. There is no password: this is a demo, say so if asked.
import 'server-only';
import { cookies } from 'next/headers';
import type { Profile, Role } from './types';
import { getProfile } from './queries';

export const UID_COOKIE = 'ps_uid';
export const ROLE_COOKIE = 'ps_role';
export const HOME_BY_ROLE: Record<Role, string> = { farmer: '/f', wholesaler: '/market', admin: '/admin' };

export async function getCurrentUser(): Promise<Profile | null> {
  const id = (await cookies()).get(UID_COOKIE)?.value;
  return id ? getProfile(id) : null;
}

/** Use at the top of every server action and every protected server component. */
export async function requireUser(roles?: Role | Role[]): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) throw new Error('NOT_SIGNED_IN');
  if (roles && !([] as Role[]).concat(roles).includes(user.role)) throw new Error('WRONG_ROLE');
  return user;
}
