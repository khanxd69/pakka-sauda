// Pakka Sauda: Uplift AI provider calls. SERVER ONLY. Owner: Workstream C.
// Request formats confirmed in C0.2 (context/project/07-voice.md).
import 'server-only';

const BASE = 'https://api.upliftai.org/v1';

function apiKey(): string {
  const k = process.env.UPLIFT_API_KEY;
  if (!k) throw new Error('UPLIFT_KEY_MISSING');
  return k;
}

/** Urdu text -> MP3 bytes (TTS). */
export async function synthesize(text: string): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}/synthesis/text-to-speech`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceId: process.env.UPLIFT_VOICE_ID || 'v_8eelc901', text, outputFormat: 'MP3_22050_128' }),
  });
  if (!res.ok) throw new Error(`UPLIFT_TTS_${res.status}`);
  return res.arrayBuffer();
}

/** Recorded audio -> Urdu transcript (Scribe). Multipart fields: file, model, language, domain. */
export async function transcribe(audio: Blob): Promise<string> {
  const type = audio.type || 'audio/webm';
  const ext = type.includes('mp4') ? 'mp4' : type.includes('mpeg') ? 'mp3' : type.includes('ogg') ? 'ogg' : 'webm';
  const form = new FormData();
  form.append('file', audio, `speech.${ext}`);
  form.append('model', 'scribe');
  form.append('language', 'ur');
  form.append('domain', 'farming');
  const res = await fetch(`${BASE}/transcribe/speech-to-text`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });
  if (!res.ok) throw new Error(`UPLIFT_STT_${res.status}`);
  const json = (await res.json()) as { transcript?: unknown };
  return typeof json.transcript === 'string' ? json.transcript : '';
}
