// Pakka Sauda: database client. SERVER ONLY. Owner: Workstream A.
// Uses the service-role key, which bypasses RLS. Never import this from a 'use client' file.
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('SUPABASE_ENV_MISSING: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

/** numeric columns can arrive as strings; coerce at the query boundary so the rest of the app sees numbers. */
export const toNum = (v: unknown): number => Number(v);
export const toNumOrNull = (v: unknown): number | null => (v == null ? null : Number(v));
