// Pakka Sauda: POST /api/voice/stt (multipart field "audio"). Owner: Workstream C. Contract: 04-contracts.md section 6.
// 501 when STT_PROVIDER is not 'uplift' (the browser recognises speech itself); 502 on upstream failure.
import { z } from 'zod';
import { transcribe } from '@/lib/voice/uplift';

const MAX_BYTES = 2 * 1024 * 1024;
const AudioSchema = z.instanceof(Blob).refine((b) => b.size > 0, 'EMPTY_AUDIO').refine((b) => b.size <= MAX_BYTES, 'AUDIO_TOO_LARGE');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function POST(req: Request) {
  if (process.env.STT_PROVIDER !== 'uplift') return json({ error: 'NOT_IMPLEMENTED' }, 501);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ error: 'BAD_FORM' }, 400);
  }
  const parsed = AudioSchema.safeParse(form.get('audio'));
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? 'BAD_AUDIO' }, 400);
  try {
    return json({ transcript: await transcribe(parsed.data) });
  } catch (e) {
    console.error('[stt]', e instanceof Error ? e.message : e);
    return json({ error: 'STT_FAILED' }, 502);
  }
}
