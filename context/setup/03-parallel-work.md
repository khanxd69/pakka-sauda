# Setup 3: Working in parallel without collisions

Four people (one on a separate laptop with Codex) and several agents edit one repo for 5 hours. These rules keep merges clean.

## The four things that make parallel work safe

1. **Disjoint file ownership.** Each workstream edits only its own folders (the table in `AGENTS.md`). Two branches never touch the same file, so merges can't conflict.
2. **Frozen contracts at 0:20.** Types, schemas, query and action signatures, component props, clip IDs and routes are fixed (`context/project/04-contracts.md`). Everyone codes against them from minute 20.
3. **Stubs with fixtures.** Every cross-team function exists from Phase 0. It returns fixture data or `NOT_IMPLEMENTED`, so nobody waits for another team to start.
4. **One dependency install, one shadcn install, one schema** (A, Phase 0). `package.json`, `package-lock.json`, `components/ui/**` and the schema are the usual sources of conflict, and nobody else touches them.

## Branches

| Branch | Owner | Merges into `main` |
|---|---|---|
| `main` | A (integrator) | n/a; production deploy |
| `ws/a-backend` | A | At every checkpoint, first |
| `ws/b-farmer` | B | At checkpoints, after A |
| `ws/c-voice` | C | At checkpoints, after A (before B if B needs a new voice feature) |
| `ws/d-buyer` | D (Codex laptop) | At checkpoints, last |

- **Commit** at least every 30 minutes: `[<step-id>] <message>`. Push every commit, which gives a Vercel preview per branch.
- **Pull `main` into your branch** right after each checkpoint merge: `git pull origin main` (on your `ws/*` branch). Since files are disjoint, this should never conflict. If it does, someone broke ownership: tell A.
- **Don't** rebase shared branches, force-push, or commit `.env.local`.

## Checkpoint merge protocol (A runs it; about 10 min)

At **1:45** (Checkpoint 1), **3:30** (Checkpoint 2) and **4:15** (freeze):

1. Everyone pushes their branch and posts "ready", or "not ready: <what>". Unfinished work stays behind a feature check: don't link to unfinished screens.
2. A merges in order: `ws/a-backend` → `ws/c-voice` → `ws/b-farmer` → `ws/d-buyer`, using `git merge --no-ff`.
3. After each merge: `npm run typecheck && npm test && npm run build`. If one fails, revert that merge (`git revert -m 1 <merge>`) and tell the owner. Never fix someone else's file during a merge.
4. Push `main`. Vercel deploys production.
5. A runs the checkpoint smoke test (listed in the phase file) on the production URL, on the phone and on a laptop.
6. Post "main updated: pull now". Everyone pulls `main` into their branch.

## Contract changes mid-build

- Additive only: new optional field, new function, new clip ID. **Never rename or remove anything.**
- The requester posts a `CONTRACT CHANGE REQUEST` (format in AGENTS.md).
- The owner commits it directly to `main` with the message `[contract] …`, tags `contracts-vN`, and posts "pull main".
- Clip and phrase additions are owned by C; type, schema and action additions by A.

## Shared Supabase database etiquette

- One database for everyone, seeded with fixed IDs. Your test data shows up for others, which is fine.
- **Only A** runs SQL that changes structure. Anyone may run `select reset_demo();`, but **announce it first**, because it wipes everyone's test listings.
- D owns `seed-prices.sql`. Run it once in the morning, or again after changing the prices.

## The Codex laptop (D)

- Works only in D's folders: `app/page.tsx`, `app/market/**`, `app/saudas/**`, `app/bids/**`, `app/admin/**`, `components/buyer/**`, `components/admin/**`, `supabase/seed-prices.sql`, `pitch/**`.
- Codex reads `AGENTS.md` automatically. Start every task with the step ID: "Implement step D1.3 from context/phases/phase-1-core-loop.md."
- Codex runs in a sandbox. Allow `npm` commands, but **never** `npm install <new package>`: everything is already installed.
- Uses the same `.env.local` values (shared privately). Never pastes secrets into Codex chat.
- Pushes `ws/d-buyer`. Doesn't merge into `main`; A does at checkpoints.

## Agents in parallel on one laptop

You may run two agents at once (e.g. Kiro's agent on one step and Claude Code in the terminal on another) **only if** their steps' file lists don't overlap. Otherwise run them one after the other. Never point two agents at the same file.

## When something blocks you

| Blocked by | Do this |
|---|---|
| A query or action is still a stub | Keep coding against the signature using the fixture data. If you need to test a write, return to it after the next checkpoint. |
| A voice component is still a stub | Use it anyway; the stub renders a usable fallback (numeric input, browser voice). |
| You need a new field, prop or clip | `CONTRACT CHANGE REQUEST`, then continue with a `// TODO(contract):` |
| The build fails on `main` after a merge | A reverts that merge. The owner fixes it on their branch. |
| Running late | Cut by the phase file's cut order. Never cut P0. |
