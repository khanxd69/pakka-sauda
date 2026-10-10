# AGENTS.md: Pakka Sauda

Rules for every coding agent on this repo: Claude Code, Codex, Kiro's agent. Kiro and Codex load this file automatically. Claude Code loads it through `CLAUDE.md`.

## What we are building

**Pakka Sauda** is a hackathon MVP: a mobile-first web app where a Pakistani potato farmer lists a crop by Urdu voice. Verified wholesalers bid a **price per kg for each grade** (A/B/C). The farmer accepts, and the buyer pays token money (simulated). At collection the buyer records the weighed kg, grade and a photo. The money is then calculated by one rule:

**final amount = weighed kg × agreed price for that grade.**

The farmer confirms, or disputes the grade, and a human reviewer decides. One complete deal is the demo.

Full context: `context/README.md`. Read the files it lists for your step before writing code.

## How to work on a step

1. You will be given a step ID, e.g. `B1.3`. Open `context/phases/phase-<n>-*.md` and find that step.
2. Read every file listed under **Read first** for that step.
3. Edit **only** the files listed under **Files** for that step, and only within your workstream's folders (table below).
4. Implement everything the step asks. The step text is the requirement: don't skip parts, and don't add features that aren't in it.
5. Run the checks under **Done when**. Always run `npm run typecheck` and `npm test`.
6. Commit on your workstream branch with the message `[<step-id>] <what changed>`, e.g. `[B1.3] farmer price screen with AMIS reference`.
7. Reply with: what you did, the files changed, the checks run (with results), and anything skipped or assumed.

## File ownership (parallel work depends on this)

| Workstream | Branch | Owns (may edit) |
|---|---|---|
| A: Backend and rules | `ws/a-backend` | `supabase/**`, `lib/*.ts` (not `lib/voice/**`), `app/actions/**`, `middleware.ts`, `app/layout.tsx`, `app/globals.css`, `components/shared/**`, `package.json`, `package-lock.json`, config files |
| B: Farmer app | `ws/b-farmer` | `app/f/**`, `components/farmer/**`, `public/img/**` |
| C: Voice and media | `ws/c-voice` | `lib/voice/**`, `components/voice/**`, `components/media/**`, `app/api/voice/**`, `public/audio/**`, `public/voice-test.html`, `scripts/**` |
| D: Buyer, admin, pitch | `ws/d-buyer` | `app/page.tsx` (choose user), `app/market/**`, `app/saudas/**`, `app/bids/**`, `app/admin/**`, `components/buyer/**`, `components/admin/**`, `supabase/seed-prices.sql`, `pitch/**` |

- **Never edit a file outside your workstream**, even to "just fix a type". Stop and report the exact change needed instead (see *Contract changes*).
- `components/ui/**` (shadcn) is created in Phase 0 by A. Don't run `shadcn add` later; if you need a missing component, ask A.
- **Never add a dependency.** Everything needed is installed in Phase 0. If you truly need one, stop and ask A.
- **Never change the database schema.** A owns `supabase/`. Schema changes go in `supabase/patches/NNN_*.sql`, written by A only.

## Frozen contracts (`contracts-v1`)

These are fixed after Phase 0. Import them and don't change them:

- `lib/types.ts`, `lib/schemas.ts`, `lib/config.ts`, `lib/format.ts`
- `lib/settle.ts`, `lib/net.ts`, `lib/sauda-machine.ts`, `lib/rules.ts`
- The function signatures in `lib/queries.ts` and `app/actions/*.ts`
- The component props of `components/voice/*`, `components/media/*`, `components/shared/*`
- The clip IDs in `lib/voice/clips.json`
- The function names and arguments in `lib/voice/phrases.ts`
- Routes, statuses and API shapes in `context/project/04-contracts.md`

Their *bodies* may be stub implementations that the owner replaces later. Code against the signature, not the stub's behaviour.

## Hard rules

1. **Money comes only from `lib/settle.ts`** (and `lib/net.ts` for the farmer's comparison). Never compute rupee amounts inline in a component or action.
2. **Sauda status changes only through `lib/transition.ts`** (`applyTransition` / `applyCancel`), which enforces `lib/sauda-machine.ts` and writes a `sauda_events` row. No direct `update saudas set status`.
3. **Every write is a server action** in `app/actions/**`. Each one:
    - starts with `requireUser(role)`;
    - parses its input with the Zod schema from `lib/schemas.ts`;
    - returns `ActionResult` (use `run()` from `app/actions/_result.ts`);
    - calls `revalidatePath` for the pages it affects.
4. **The database is server only.** Import `lib/db.ts`, `lib/queries.ts` and `lib/session.ts` only in server components, server actions and route handlers. Never in a `'use client'` file. Secrets never reach the browser.
5. **Units:** prices are stored in rupees **per kg**, quantities in **kg**. Farmer screens display per **mann** (40 kg) using `lib/format.ts`.
6. **Farmer screens** (`app/f/**`) follow `.kiro/steering/farmer-ui.md`:
    - Urdu, right to left;
    - one question per screen;
    - audio first;
    - tap targets of at least 56 px;
    - no paragraphs of text for the farmer to read.
7. **AI never decides money or grades.** The LLM only turns speech into numbers. Every voice-extracted value is read back and confirmed by the farmer.
8. **Nothing real is charged.** Every simulated money step shows `<DemoBadge />`.
9. **No invented facts in the UI.** Reference prices show their source and date. Illustrative numbers say "ILLUSTRATIVE".
10. Use TypeScript strict mode, no `any`, server components by default, and `'use client'` only where needed. Put `// ASSUMPTION:` on any guess.

## Contract changes

If your step needs something a contract doesn't provide (a field, a query, a prop):

1. Stop. Don't work around it by editing someone else's file or duplicating logic.
2. Write the request in your reply, in this format:
    ```
    CONTRACT CHANGE REQUEST
    File: <path>
    Change: <exact signature/field>
    Why: <step id + reason>
    ```
3. Continue with the parts of the step that don't depend on it, using a local `// TODO(contract):` placeholder.

## Ponytail (if installed)

The team may run Ponytail, a "smallest correct solution" ruleset. Use **lite** mode during the build (`/ponytail lite` in Claude Code, `@ponytail lite` in Codex).

Everything a phase step asks for is an explicit requirement, so Ponytail must not remove or skip any of these:

- Zod validation
- `requireUser` checks
- the `transition()` / `sauda_events` audit trail
- tests
- RTL and accessibility
- DEMO labels
- read-back confirmation

Mark deliberate shortcuts with `// ponytail:` comments.

## Commands

```
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run lint
```

## Demo identities (fixed IDs in `lib/config.ts` → `DEMO_IDS`)

| Role | Name | Note |
|---|---|---|
| Farmer | Rashid | Demo protagonist; owns the seeded dispute sauda |
| Farmer | Naseem Bibi | Seeded open listing and settled history |
| Farmer | Akram | Seeded open listing |
| Wholesaler | Imran Traders | Verified |
| Wholesaler | Lahore Fresh | Verified |
| Wholesaler | Pak Agro Buyers | Unverified |
| Admin | Reviewer | Resolves disputes |
