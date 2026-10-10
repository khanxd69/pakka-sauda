# Setup 1: Before build day

None of this is code, so it's safe to do before the clock starts. Tick everything off the night before.

## Rules and roles (whole team, 15 min)

- [ ] Ask the organisers:
    - Is **prepared code** allowed? This pack includes tested reference code in `context/reference/`.
    - Are prepared docs, steering files and pre-generated audio allowed?
    - How many people per team? One track per team? What are the judging criteria?
- [ ] If prepared code is **not** allowed: delete `context/reference/` before building. The agents then generate those files from `context/project/03-data-model.md` and `04-contracts.md`, which describe everything. Phase 0 then takes about 20 minutes longer: drop P1 items first.
- [ ] Assign the workstreams:
    - **A** (backend and rules): the strongest backend person; also integrates and merges.
    - **B** (farmer app): the strongest frontend person.
    - **C** (voice and media): whoever owns the demo phone.
    - **D** (buyer, admin, pitch): the **Codex laptop** person is a good fit, since D touches only its own folders.
    - With **3 people**: B also takes C's voice work, and D owns the demo phone.
- [ ] Decide who presents (D by default) and who drives the phone (C).

## Accounts (each owner)

| Who | Account | Notes |
|---|---|---|
| A | GitHub repo `pakka-sauda` (private), with all teammates added as collaborators | Create it empty; A pushes the scaffold at 0:00 |
| A | Supabase project (free tier, region closest to Pakistan, e.g. Mumbai `ap-south-1` or Singapore) | Invite teammates to the org so they can read logs. Keep the service-role key private. |
| A | Vercel account linked to GitHub | Imports the repo at A0.5 |
| C | Uplift AI account plus API key, and a chosen voice ID | Free plan: about 10 TTS minutes/month. Check whether Scribe (STT) is included; if not, decide on Starter ($5). |
| any | Anthropic API key (optional, for the number-reading fallback) | Not required: the deterministic parser handles common cases |
| all | Kiro installed and signed in; Node 20+ (`node -v`); git | n/a |
| B, C (and A if wanted) | Claude Code (`npm i -g @anthropic-ai/claude-code`, then `claude` once to sign in) | Runs in Kiro's terminal |
| D | Codex CLI installed and signed in | Separate laptop |
| optional | Ponytail for each tool: see `setup/04-agent-tooling.md` | Use lite mode |

## Content prep (no code)

- [ ] **C:** ask a native Urdu speaker to read `context/reference/lib/voice/clips.json` and the sentences in `phrases.ts` aloud, then fix the wording. Keep the IDs.
- [ ] **C:** listen to the Uplift voices and pick one. Test that one TTS call works with curl (see `07-voice.md`).
- [ ] **C:** if pre-generated audio is allowed, run `scripts/generate-audio.mjs` tonight and keep the MP3s for C1.2.
- [ ] **D:** bookmark `amis.pk`. Find the potato rows for Lahore and Okara and note how the page shows the unit.
- [ ] **D:** draft the 5 slides (`08-demo-and-rehearsal.md`).
- [ ] **B:** collect or prepare the images listed in `05-farmer-ui.md` (potato, grade A/B/C photos, calendar icons) and credit their sources.
- [ ] **Anyone:** phone one potato buyer and one farmer (10 min each):
    - How is the grade decided today?
    - Would a buyer pay token money for a crop that's ready within two weeks?
    - Who pays for loading and transport?

    Adjust the illustrative grades and costs in `lib/config.ts` (A) to match.
- [ ] **C:** demo phone: Android with Chrome, charged; a mobile hotspot plan ready.

## Everyone reads (30 min)

`AGENTS.md` → `context/README.md` → `context/project/01–04` → your own UI doc (05, 06 or 07) → `context/phases/phase-0-foundation.md` → your steps in phase 1.
