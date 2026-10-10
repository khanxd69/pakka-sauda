// Pakka Sauda: POST /api/voice/extract { transcript, field }. Owner: Workstream C. Contract: 04-contracts.md section 6.
// Parser first, Claude fallback (lib/voice/extract.ts). The farmer always confirms the value afterwards.
import { z } from 'zod';
import { extractField } from '@/lib/voice/extract';

const BodySchema = z.object({ transcript: z.string().max(2000), field: z.enum(['quantity', 'price']) });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'BAD_JSON' }, 400);
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return json({ error: 'BAD_INPUT' }, 400);
  return json(await extractField(parsed.data.transcript, parsed.data.field));
}
