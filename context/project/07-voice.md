# 07: Voice (Workstream C)

Voice is an accessibility layer: it must never block the deal. **Fallback order:** Uplift voice → browser voice → giant digits on screen; mic → number pad.

## Providers (checked October 2026; re-check on the day)

| Need | Primary | Fallback | Notes |
|---|---|---|---|
| Fixed prompts | **Uplift AI TTS**, generated once to MP3 (`scripts/generate-audio.mjs`) | A teammate records them on a phone (~20 min) | 28 clips use about 2 minutes of TTS |
| Dynamic sentences (amounts, offers) | **Uplift AI TTS** via `GET /api/voice/tts` (cached) | Browser `speechSynthesis` with `lang='ur-PK'` (if the phone has an Urdu voice); else digits on screen | Free plan: about **10 TTS minutes a month**. Starter is $5/month if rehearsals use it up. |
| Speech-to-text | **Uplift Scribe** (`language: 'ur'`, `domain: 'farming'`) **or** browser Web Speech API `ur-PK`, whichever wins the phone test | Number pad | Check whether the free plan covers Scribe |
| Transcript → number | `parseUrduNumber()` (deterministic, tested) | Claude (`ANTHROPIC_API_KEY`, model `LLM_MODEL`) | Claude **can't** take audio, so it only reads the transcript. Don't translate to English. |

Not useful here: Amazon Transcribe and Amazon Polly don't list Urdu.

### Uplift API facts we have

- **TTS:**
    - `POST https://api.upliftai.org/v1/synthesis/text-to-speech`
    - headers: `Authorization: Bearer <UPLIFT_API_KEY>`, `Content-Type: application/json`
    - body: `{ "voiceId": "v_8eelc901", "text": "...", "outputFormat": "MP3_22050_128" }`
    - response: raw audio bytes
    - Voice samples: <https://docs.upliftai.org/orator_voices>; pick one and set `UPLIFT_VOICE_ID`.
- **STT:**
    - endpoint reported as `https://api.upliftai.org/v1/transcribe/speech-to-text`
    - models: `scribe` (40 credits/min) or `scribe-mini` (20 credits/min)
    - `language: 'ur'`; `domain: 'farming'` | `'phone-commerce'`
    - **The multipart field names, auth header and response JSON field are NOT confirmed.** Step C0.2 confirms them with one curl call before any code is written, then records them here.
- Keys look like `sk_api_...`. Get one at <https://platform.upliftai.org/studio/api-keys>.

## Step C0.2: phone test (decides the tiers; 15 min)

1. Deploy, or use any Vercel preview, so `/voice-test.html` is served over HTTPS (the mic needs HTTPS).
2. On the **demo Android phone** in Chrome, say the 10 test phrases on the page with method 1 (browser `ur-PK`). Count the exact matches.
3. Record a 5-second sample (method 3), download it, and send it to Uplift Scribe with curl. Count the matches across the 10 phrases. Note the recording `mimeType`; Uplift must accept it.
4. Check whether the phone has an Urdu TTS voice (method 2).
5. Write the results here and in team chat. Set `STT_PROVIDER` and `NEXT_PUBLIC_STT_PROVIDER` to `uplift` or `browser`.

**Rule:** if neither gets 7/10 numbers right, ship the number pad as the main input and keep the mic as a bonus. Voice *output* still makes the app voice-first.

## Components (props frozen; see 04-contracts §5)

### `AudioPrompt`

- Plays `/audio/ur/<clip>.mp3` and shows a large replay button.
- `autoPlay` plays once on mount.
- **Autoplay policy:** Chrome allows sound only after the user has interacted with the page. The tap on the choose-user screen counts within the same tab, so client-side navigations keep working. If `play()` rejects, make the replay button pulse.

### `SpeakButton`

1. Fetch `GET /api/voice/tts?text=<encodeURIComponent(text)>`.
2. On 200, play the blob and keep it in a module-level `Map<text, objectURL>` so replays are free.
3. On any error, fall back to `speechSynthesis` with `lang='ur-PK'`.
4. If no Urdu voice exists, show a tooltip "Audio unavailable" and do nothing else; the text is on screen.

### `VoiceNumberInput`

- **Layout, top to bottom:**
    1. the value in huge digits (`dir="ltr"`), with the unit word under it (کلو / من);
    2. the kg/mann toggle (only if `onUnitChange` is set);
    3. a 3×4 number pad: 1–9, ⌫, 0, and a clear button. Keys are at least 64 px.
    4. a big 🎤 button.
- **Mic flow:**
    1. Tap the mic and play `mic_listening`.
    2. Record (Uplift path: `MediaRecorder`, max 6 s, stop on second tap; browser path: `SpeechRecognition`, `lang='ur-PK'`).
    3. Get the transcript.
    4. `POST /api/voice/extract { transcript, field }`.
    5. If there's a value: `onChange(value converted to the displayed unit, transcript)`. If the speaker said a unit different from the displayed one, convert (`mannToKg` / `kgToMann`). For a price, a spoken "per kg" is converted to per mann.
    6. If there's no value: play `mic_retry`.
- The parent screen always does the read-back. This component never submits anything.

### `CameraCapture` (P1)

- An in-page camera using `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })` with a `<video>` preview and a big shutter button.
- Capture draws to a `<canvas>` and produces a JPEG `File` (quality 0.8, max 1600 px).
- Location: `navigator.geolocation.getCurrentPosition` with a 5 s timeout; `null` if denied.
- The `hint` text is overlaid on the preview.
- **No gallery input.** If `getUserMedia` fails, fall back to `<input capture="environment">` and show "fallback camera".

## Route handlers

### `app/api/voice/tts/route.ts`

- `export async function GET(req)`.
- Validate the text: trim, 1–500 characters.
- Keep a module-level `Map` cache of up to 200 entries.
- Call Uplift, then return `new Response(bytes, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=86400' } })`.
- On failure, return `502` with JSON `{ error }`.
- Runtime: Node (default).

### `app/api/voice/stt/route.ts`

- `export async function POST(req)`.
- `const form = await req.formData(); const audio = form.get('audio') as Blob`.
- Reject audio over 2 MB with `400`.
- If `STT_PROVIDER !== 'uplift'`, return `501`.
- Forward to Uplift Scribe using the fields confirmed in C0.2.
- Return `{ transcript }`. Keep provider details in `lib/voice/uplift.ts` (C) so the route stays tiny.

### `app/api/voice/extract/route.ts`

- `POST`.
- Validate `{ transcript: string ≤ 2000, field: 'quantity' | 'price' }` with Zod.
- Return `await extractField(transcript, field)` from `lib/voice/extract.ts`.

## Urdu content

- Fixed prompts live in `lib/voice/clips.json` (Urdu + Roman). Dynamic sentences come from `lib/voice/phrases.ts`. A native speaker on the team should read both aloud once and fix any wording. **The IDs and function signatures stay the same.**
- Numbers are spoken as Urdu words by default (`toUrduWords`), e.g. 358800 → "تین لاکھ اٹھاون ہزار آٹھ سو".
    - If the phone test shows Uplift reads digits well, set `NUMBER_STYLE = 'digits'` in `phrases.ts`.
    - Check spellings in the `URDU_0_99` list, since they vary by region.
- `parseUrduNumber` handles:
    - digits, Urdu digits and commas;
    - 0–99 words plus سو / ہزار / لاکھ / کروڑ;
    - ڈیڑھ, ڈھائی, ساڑھے, سوا, پونے;
    - Roman "hazar / lakh / sau";
    - and ignores "ایک من / فی من" (per mann).

  24 test cases pass (`lib/voice/voice.test.ts`).

## Budget guardrails

- Never call TTS in a loop or on every render. `SpeakButton` fetches only when tapped or on `autoPlay`, once per text.
- Pre-generate fixed clips once. Don't run `generate-audio.mjs --force` repeatedly.
- During development, set `NEXT_PUBLIC_TTS_DISABLED=1` locally to force the browser voice and save Uplift minutes. `SpeakButton` checks it.
