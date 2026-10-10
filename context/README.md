# Pakka Sauda: context pack

Everything a coding agent (Claude Code in Kiro, Kiro's own agent, Codex) or a teammate needs to build the hackathon MVP. It covers the product, the rules, the frozen contracts, the setup, and one file per phase with steps per workstream.

**Pakka Sauda:** an Urdu voice-guided harvest marketplace where the deal terms are locked before the truck arrives. One crop (potatoes), one district (Okara → Lahore buyers), one complete deal: list → bid (grade-price ladder) → accept → token → collect → confirm or dispute → settle.

## Folder map

```
AGENTS.md                      rules every agent follows (Codex and Kiro load it automatically)
CLAUDE.md                      Claude Code entry; imports AGENTS.md
.kiro/steering/                Kiro steering: product, tech, structure (always), farmer-ui, money-and-state (by file)
.kiro/specs/pakka-sauda/       Kiro spec: requirements (EARS), design index, tasks mapped to phase steps
context/
  README.md                    this file
  project/
    01-product.md              users, the one deal, locked decisions, real vs simulated
    02-business-rules.md       settlement formula, rules table, who may do what, evidence, net comparison
    03-data-model.md           tables, functions, seed scenario, database rules
    04-contracts.md            FROZEN: types, queries, actions, routes, components, voice API, env, errors
    05-farmer-ui.md            farmer screens F1–F11 (Workstream B)
    06-buyer-admin-ui.md       wholesaler and admin screens (Workstream D)
    07-voice.md                Uplift TTS/STT, browser fallback, number reading, phone test (Workstream C)
    08-demo-and-rehearsal.md   demo script, slides, judges' Q&A, rehearsal checklist
    09-glossary.md
  setup/
    01-before-build-day.md     accounts, roles, rules check, content prep
    02-hour-zero-setup.md      exact commands for 0:00–0:35
    03-parallel-work.md        branches, ownership, checkpoint merges, Codex laptop, shared DB
    04-agent-tooling.md        Kiro, Claude Code, Codex, Ponytail, prompt templates
    env.example
  phases/
    phase-0-foundation.md      0:00–0:35  scaffold, contracts-v1, stubs, deploy, DB
    phase-1-core-loop.md       0:35–1:45  list → bid → accept → token   (Checkpoint 1)
    phase-2-settlement.md      1:45–3:30  collect → confirm/dispute → settle, admin   (Checkpoint 2)
    phase-3-p1-trust.md        3:30–4:15  camera evidence, code, expiry, cancels, reset   (FREEZE)
    phase-4-demo-prep.md       4:15–5:00  rehearse ×2, backup video, slides
  reference/                   Phase 0 source files, copied into the repo at step A0.2 (tested)
```

## Reading order

| Who | Read |
|---|---|
| Everyone (before the day) | `AGENTS.md` → this file → `project/01`–`04` → `setup/01` and `03` |
| A: backend and rules | + `project/02`, `03`, `.kiro/steering/money-and-state.md`, `setup/02`, all A steps |
| B: farmer app | + `.kiro/steering/farmer-ui.md`, `project/05`, `07` (components section), all B steps |
| C: voice and media | + `project/07`, `05` (to know where each clip plays), all C steps |
| D: buyer, admin, pitch (Codex) | + `project/06`, `08`, `setup/03` (Codex laptop section), all D steps |
| An agent doing one step | `AGENTS.md`, plus the step's **Read first** list. Nothing else is required. |

## Timeline (5 hours; with 6, see below)

| Clock | Phase | Exit |
|---|---|---|
| 0:00–0:35 | 0 Foundation | `contracts-v1` on main at **0:20**; production live; DB seeded |
| 0:35–1:45 | 1 Core loop | **Checkpoint 1:** list → bid → accept → token on production |
| 1:45–3:30 | 2 Settlement | **Checkpoint 2:** the full demo script works, including the dispute |
| 3:30–4:15 | 3 P1 trust | **FREEZE** at 4:15 |
| 4:15–5:00 | 4 Demo prep | Two clean rehearsals, backup video, final slides |

**If you get 6 hours:** move the freeze to 5:15 and spend the extra hour on these P2 items, in order:

1. One free spoken sentence fills every field (`extractField` across all fields; C + B).
2. A farmer counter-offer (needs a contract addition: A + B + D).
3. A seeded field-inspection report on one listing (A seeds it; D shows it).
4. A completed-sauda count as reputation (A query; B + D display).
5. Crop-loss report (A + B + D).

## How to run a step with an agent

```
Implement step <ID> from context/phases/<file>.md.
Follow AGENTS.md. Read the step's "Read first" files before coding.
Edit only the files listed under the step's "Files". Do not add dependencies or change contracts.
When done: run npm run typecheck && npm test, then report files changed, checks run, and anything skipped or assumed.
```

More templates (fix, review, contract change) are in `setup/04-agent-tooling.md`.

## What's verified in this pack

- `reference/supabase/*.sql` was run on Postgres (PGlite). Schema, seed, `accept_bid` (token maths, double-accept refused) and `reset_demo` (run twice) all work.
- `reference/lib/**` has 48 Vitest tests passing:
    - settlement worked example
    - token
    - bid preview
    - net comparison
    - state machine
    - bid rules
    - schemas
    - fixtures
    - Urdu number parsing and writing (24 cases)
    - phrases
- All reference TypeScript (stubs, actions, components, transition helper, middleware) type-checks, and builds in a Next.js 15 app.
- **Not verified here (needs your accounts):**
    - Supabase-js queries against a live project: `lib/transition.ts` is a reference to confirm in A1.6;
    - Uplift API calls (the TTS format is from Uplift's docs; the STT request format must be confirmed in C0.2);
    - Urdu wording, which needs a native-speaker read-through.

## Ground rules (summary of AGENTS.md)

- Edit only your workstream's folders.
- Contracts are frozen; changes are additive and go through the owner.
- Money comes only from `lib/settle.ts`; status changes only through `lib/transition.ts`.
- The farmer UI is Urdu, RTL, audio first, one question per screen, with read-back before commit.
- No new dependencies, no schema changes (except A), no real money, no invented facts.
