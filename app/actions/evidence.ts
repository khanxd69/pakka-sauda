'use server';
// Pakka Sauda: evidence photo upload (P1). Owner: Workstream A. Signature FROZEN (contracts-v1).
// FormData fields: saudaId, kind ('collection'|'dispute'), file (image), lat?, lng?
// captured_at is the database default (server time), never the client's.
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { IdSchema } from '@/lib/schemas';
import { requireUser } from '@/lib/session';
import { loadSauda } from '@/lib/transition';
import type { ActionResult } from '@/lib/types';
import { run } from './_result';

const MAX_BYTES = 5 * 1024 * 1024;
const Kind = z.enum(['collection', 'dispute']);
const Coord = z.coerce.number().finite().optional();

export async function uploadEvidence(form: FormData): Promise<ActionResult<{ id: string; url: string }>> {
  return run(async () => {
    const user = await requireUser(['farmer', 'wholesaler']);
    const saudaId = IdSchema.parse(form.get('saudaId'));
    const kind = Kind.parse(form.get('kind'));
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('NOT_AN_IMAGE');
    if (!file.type.startsWith('image/')) throw new Error('NOT_AN_IMAGE');
    if (file.size > MAX_BYTES) throw new Error('FILE_TOO_LARGE');
    const lat = Coord.parse(form.get('lat') || undefined);
    const lng = Coord.parse(form.get('lng') || undefined);

    const s = await loadSauda(saudaId);
    const allowed = kind === 'collection' ? user.role === 'wholesaler' && user.id === s.wholesaler_id : user.role === 'farmer' && user.id === s.farmer_id;
    if (!allowed) throw new Error('NOT_YOUR_SAUDA');

    const path = `${saudaId}/${kind}-${Date.now()}.jpg`;
    const bucket = db().storage.from('evidence');
    const { error: ue } = await bucket.upload(path, file, { contentType: file.type });
    if (ue) throw new Error(`DB_ERROR:${ue.message}`);
    const url = bucket.getPublicUrl(path).data.publicUrl;

    const { data, error } = await db()
      .from('evidence')
      .insert({ sauda_id: saudaId, uploaded_by: user.id, kind, url, lat: lat ?? null, lng: lng ?? null })
      .select('id')
      .single();
    if (error) throw new Error(`DB_ERROR:${error.message}`);
    revalidatePath('/', 'layout');
    return { id: data.id as string, url };
  });
}
