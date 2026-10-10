# Phase 0: Foundation (0:00 → 0:35)

**Goal:** one repo on `main` with every dependency, every shared contract and every stub in place, tagged `contracts-v1`. Each workstream branch exists, production is deployed, and the database is seeded. From **0:20** everyone codes in parallel against the contracts.

**Exit criteria:**

- [ ] `main` builds and `npm test` passes (48 tests)
- [ ] `contracts-v1` tag pushed
- [ ] `ws/a-backend`, `ws/b-farmer`, `ws/c-voice`, `ws/d-buyer` exist
- [ ] Production URL live
- [ ] Supabase has 7 profiles
- [ ] Every teammate has run `npm run dev`

**Step format** (used in every phase file):

- **Owner**, **priority**, **time box**, **depends on**
- **Read first:** docs the agent must read
- **Files:** the only files the step may create or edit
- **Do:** the requirements
- **Done when:** checks that must pass

---

## Workstream A

### A0.1: Scaffold and install everything

- **Owner:** A · **P0** · 10 min · **Depends on:** nothing
- **Read first:** `context/setup/02-hour-zero-setup.md` Part 1 (steps 1–3), `.kiro/steering/tech.md`
- **Files:** the new Next.js project; `package.json`, `package-lock.json`, `components/ui/**`, `components.json`, `app/globals.css` (shadcn edits it)
- **Do:**
    1. Run `create-next-app@15` with the exact flags given.
    2. Install the runtime deps (`@supabase/supabase-js`, `zod@^3.25`, `@anthropic-ai/sdk`, `server-only`) and `vitest@^3` as a dev dep.
    3. Run `shadcn init -d` and add the full component list given in setup Part 1.
- **Done when:** `npm run dev` serves the default page; `components/ui/button.tsx` exists.

### A0.2: Drop in the context pack and the reference files

- **Owner:** A · **P0** · 5 min · **Depends on:** A0.1
- **Read first:** `context/setup/02-hour-zero-setup.md` Part 1 (steps 4–5 and the edits after them)
- **Files:** `AGENTS.md`, `CLAUDE.md`, `.kiro/**`, `context/**`, plus the copied reference files:
    - `lib/**`, `app/actions/**`, `app/api/voice/**`
    - `components/voice/**`, `components/media/**`, `components/shared/**`
    - `supabase/**`, `scripts/**`, `public/voice-test.html`
    - `middleware.ts`, `vitest.config.mts`, `.env.example`
    - edits to `package.json` (scripts), `tsconfig.json`, `eslint.config.mjs`, `app/layout.tsx`, `app/page.tsx`
- **Do:**
    1. Copy exactly as described. **Don't edit the copied reference files.**
    2. Add the scripts (`typecheck`, `test`, `gen:audio`).
    3. Exclude `context` from `tsconfig.json` and ESLint.
    4. Replace `app/layout.tsx` with the given shell (`Toaster`), and `app/page.tsx` with a placeholder.
- **Done when:** the tree matches `.kiro/steering/structure.md`.

### A0.3: Verify the contracts compile and pass

- **Owner:** A · **P0** · 3 min · **Depends on:** A0.2
- **Do:** `npm run typecheck && npm test && npm run build`.
- **Done when:**
    - typecheck has 0 errors;
    - **48 tests pass** (`lib/core.test.ts` 24, `lib/voice/voice.test.ts` 24);
    - build succeeds and lists the routes `/`, `/api/voice/*` and the middleware.

  If anything fails, fix only config (tsconfig, eslint), never the reference logic. Then tell the team what changed.

### A0.4: Commit, tag, create branches → "pull now" (target 0:20)

- **Owner:** A · **P0** · 2 min · **Depends on:** A0.3
- **Do:** the git block in setup Part 1. Push `main`, tag `contracts-v1`, push the four `ws/*` branches from `main`. Post **"pull now"**.
- **Done when:** `git ls-remote --tags origin` shows `contracts-v1`, and the four branches exist on GitHub.

### A0.5: Deploy to Vercel

- **Owner:** A · **P0** · 5 min · **Depends on:** A0.4
- **Do:**
    1. Import the repo in Vercel and add all env vars (placeholders are OK for Uplift and Anthropic at this point). Deploy `main`.
    2. Share the production URL.
    3. Confirm that `<url>/voice-test.html` loads over HTTPS. C needs it for C0.2.
- **Done when:** the production URL shows the placeholder page and `/voice-test.html` loads.

### A0.6: Database

- **Owner:** A · **P0** · 8 min · **Depends on:** the Supabase project (setup 1)
- **Read first:** `context/project/03-data-model.md`
- **Files:** none in git (SQL is run in the Supabase SQL editor from `supabase/*.sql`)
- **Do:**
    1. Run `schema.sql`, `seed.sql`, `seed-prices.sql` (illustrative for now) and `storage.sql`.
    2. Put the URL and service-role key in `.env.local` and in Vercel, then redeploy.
    3. Share the values privately.
- **Done when:**
    - `select count(*) from profiles` = 7;
    - `select status from saudas order by id` = `collected`, `settled`;
    - `select accept_bid('00000000-0000-4000-8000-000000002003')` returns a uuid. Then run `select reset_demo();` to undo it.

---

## Workstream B (0:00–0:35, in parallel)

### B0.1: Prepare the farmer assets and get set up

- **Owner:** B · **P0** · until "pull now", then 10 min · **Depends on:** nothing
- **Read first:** `.kiro/steering/farmer-ui.md`, `context/project/05-farmer-ui.md`
- **Files (after pulling):** `public/img/**` (`potato.jpg`, `grade-a.jpg`, `grade-b.jpg`, `grade-c.jpg`, week icons, `CREDITS.md`)
- **Do:**
    1. Set up Kiro + Claude Code (+ Ponytail lite): `context/setup/04-agent-tooling.md`.
    2. Prepare the images. Emoji tiles are an acceptable fallback.
    3. After pulling, check out `ws/b-farmer`, run `npm ci`, and create `.env.local`.
- **Done when:** `npm run dev` works on your laptop; images are committed on `ws/b-farmer`.

## Workstream C (0:00–0:35, in parallel)

### C0.1: Uplift key and a TTS smoke test

- **Owner:** C · **P0** · 10 min
- **Read first:** `context/project/07-voice.md`
- **Do:**
    1. Create an Uplift key.
    2. Run:

        ```
        curl -X POST https://api.upliftai.org/v1/synthesis/text-to-speech \
          -H "Authorization: Bearer $UPLIFT_API_KEY" -H "Content-Type: application/json" \
          -d '{"voiceId":"v_8eelc901","text":"دس ہزار کلو آلو","outputFormat":"MP3_22050_128"}' --output test.mp3
        ```

    3. Play it. Pick the voice ID you like (`docs.upliftai.org/orator_voices`) and share `UPLIFT_VOICE_ID`.
    4. Test digits: send "10,000 کلو" and listen. Does it read the number correctly? Note the answer, because it decides `NUMBER_STYLE`.
- **Done when:** `test.mp3` plays Urdu; the voice ID and digit result are posted in team chat.

### C0.2: Phone test and STT request format

- **Owner:** C · **P0** · 15 min · **Depends on:** A0.5 (HTTPS URL for `/voice-test.html`)
- **Do:**
    1. Follow "Step C0.2" in `07-voice.md`.
    2. Confirm the Uplift Scribe request format with one curl call using the recorded sample. Find the multipart field names, the auth header and the transcript field in the response.
    3. Write the confirmed format into `context/project/07-voice.md` (C may edit that section) and commit on `ws/c-voice`.
    4. Choose the `STT_PROVIDER`.
- **Done when:** the scores (browser x/10, Uplift x/10) and the chosen provider are posted. A sets `STT_PROVIDER` / `NEXT_PUBLIC_STT_PROVIDER` in Vercel.

### C0.3: Generate the fixed prompt audio

- **Owner:** C · **P0** · 5 min · **Depends on:** C0.1, and the native-speaker review of `clips.json` (setup 1)
- **Files:** `public/audio/ur/*.mp3` (28 files), `lib/voice/clips.json` (wording fixes only; **IDs unchanged**)
- **Do:** `UPLIFT_API_KEY=… UPLIFT_VOICE_ID=… npm run gen:audio`. Listen to 3 random clips. Commit on `ws/c-voice`.
- **Done when:** 28 MP3s are committed; `npm test` still passes.

## Workstream D (0:00–0:35, in parallel)

### D0.1: Real AMIS prices

- **Owner:** D · **P0** · 10 min
- **Read first:** `context/reference/supabase/seed-prices.sql` (comments)
- **Files:** `supabase/seed-prices.sql`
- **Do:**
    1. On `amis.pk`, find today's (or the latest) potato wholesale prices for **Lahore** and **Okara**.
    2. Fill in `source = 'AMIS Punjab'`, `source_price`, `source_unit` exactly as published, `source_date`, and `price_per_kg` (converted).
    3. Run the file in the Supabase SQL editor and commit on `ws/d-buyer`.
    4. If AMIS is unreachable, keep ILLUSTRATIVE and tell the team.
    5. Tell A if the real prices differ a lot from the illustrative 50/46. The seed bid prices (42–45/kg) should stay a little below the mandi rate.
- **Done when:** `select * from reference_prices` shows today's AMIS rows (or ILLUSTRATIVE, with that noted).

### D0.2: Codex laptop and pitch skeleton

- **Owner:** D · **P0** · until "pull now"
- **Files:** `pitch/outline.md`
- **Do:**
    1. Install and sign in to Codex, plus Ponytail lite (`04-agent-tooling.md`).
    2. Clone the repo, check out `ws/d-buyer`, run `npm ci`, create `.env.local`.
    3. Copy the five-slide outline from `08-demo-and-rehearsal.md` into `pitch/outline.md`.
- **Done when:** `npm run dev` runs on the Codex laptop; Codex answers "which files may you edit?" with D's folders.

---

## If Phase 0 runs late

- At 0:20, A pushes whatever compiles. The contracts and stubs are what matter.
- The database (A0.6) can finish while others start Phase 1: the stubs serve fixture data.
- If prepared code isn't allowed, A asks the agent to create each reference file from `04-contracts.md` and `03-data-model.md`, contracts first. Plan on 0:40 instead of 0:20.
