// Pakka Sauda: generates public/audio/ur/<clip>.mp3 for every fixed prompt in lib/voice/clips.json
// using Uplift AI text-to-speech. Owner: Workstream C. Run once (step C0.3), then commit the MP3s.
//
//   UPLIFT_API_KEY=sk_api_... node scripts/generate-audio.mjs            # only missing files
//   UPLIFT_API_KEY=sk_api_... node scripts/generate-audio.mjs --force    # regenerate all
//   UPLIFT_VOICE_ID=v_xxxx ...                                           # choose a voice (default v_8eelc901)
//
// API per docs.upliftai.org (checked Oct 2026): POST https://api.upliftai.org/v1/synthesis/text-to-speech
// Authorization: Bearer <key>; JSON { voiceId, text, outputFormat }; response body = audio bytes.
// The free plan has ~10 TTS minutes a month; 28 short clips use about 2 minutes. Don't loop --force.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const KEY = process.env.UPLIFT_API_KEY;
const VOICE = process.env.UPLIFT_VOICE_ID ?? 'v_8eelc901';
const FORCE = process.argv.includes('--force');
if (!KEY) {
  console.error('Set UPLIFT_API_KEY first.');
  process.exit(1);
}

const clips = JSON.parse(readFileSync(new URL('../lib/voice/clips.json', import.meta.url), 'utf8'));
const outDir = new URL('../public/audio/ur/', import.meta.url);
mkdirSync(outDir, { recursive: true });

let made = 0;
for (const [id, clip] of Object.entries(clips)) {
  const file = new URL(`${id}.mp3`, outDir);
  if (existsSync(file) && !FORCE) continue;
  const res = await fetch('https://api.upliftai.org/v1/synthesis/text-to-speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceId: VOICE, text: clip.ur, outputFormat: 'MP3_22050_128' }),
  });
  if (!res.ok) {
    console.error(`FAILED ${id}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  made++;
  console.log(`ok ${id}`);
}
console.log(`Done. ${made} new file(s).`);
