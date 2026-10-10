// Pakka Sauda: GET /api/voice/tts?text=... Owner: Workstream C. Contract: context/project/04-contracts.md section 6.
// Clients treat any non-200 as "fall back to the browser voice".
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { synthesize } from '@/lib/voice/uplift';

const TextSchema = z.string().min(1).max(500);
const MAX_CACHE = 200;
const cache = new Map<string, ArrayBuffer>(); // per server instance; saves Uplift minutes on replays

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function GET(req: NextRequest) {
  const parsed = TextSchema.safeParse(req.nextUrl.searchParams.get('text'));
  if (!parsed.success) return json({ error: 'BAD_TEXT' }, 400);
  const text = parsed.data;
  let audio = cache.get(text);
  if (!audio) {
    try {
      audio = await synthesize(text);
    } catch (e) {
      console.error('[tts]', e instanceof Error ? e.message : e);
      return json({ error: 'TTS_FAILED' }, 502);
    }
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
    cache.set(text, audio);
  }
  return new Response(audio, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=86400' } });
}
