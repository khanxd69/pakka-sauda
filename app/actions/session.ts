'use server';
// Pakka Sauda: demo user switching. Owner: Workstream A. Real implementation from Phase 0.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/queries';
import { HOME_BY_ROLE, ROLE_COOKIE, UID_COOKIE } from '@/lib/session';

/** Called by the "choose user" screen. Sets the demo cookies and goes to that role's home. */
export async function setDemoUser(userId: string): Promise<void> {
  const p = await getProfile(userId);
  if (!p) throw new Error('UNKNOWN_USER');
  const jar = await cookies();
  jar.set(UID_COOKIE, p.id, { httpOnly: true, sameSite: 'lax', path: '/' });
  jar.set(ROLE_COOKIE, p.role, { httpOnly: true, sameSite: 'lax', path: '/' });
  redirect(HOME_BY_ROLE[p.role]);
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  jar.delete(UID_COOKIE);
  jar.delete(ROLE_COOKIE);
  redirect('/');
}
