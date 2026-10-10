# Setup 4: Agent tooling (Kiro, Claude Code, Codex, Ponytail)

Every tool reads the same rules:

| Tool | Reads automatically | Notes |
|---|---|---|
| **Kiro agent** | `.kiro/steering/*.md` (product, tech and structure always; farmer-ui and money-and-state when matching files are open) and `AGENTS.md` | Check the Steering panel shows the five files |
| **Claude Code** (in Kiro's terminal) | `CLAUDE.md`, which imports `AGENTS.md` | Run `claude` from the repo root |
| **Codex** (D's laptop) | `AGENTS.md` | Run from the repo root |

The ground truth for any step is the phase file plus `context/project/*`. Every agent gets the same prompt shape (below).

## Kiro

- Open the repo folder. Kiro picks up `.kiro/steering/` and `AGENTS.md` without any extra setup.
- **Specs:** `.kiro/specs/pakka-sauda/` holds `requirements.md`, `design.md` and `tasks.md`. They mirror the phase files, so Kiro's task list can drive the work.
    - Run tasks **one at a time** for money and state (A's tasks).
    - UI tasks can run one at a time from the task list, or by direct prompt.
    - Don't use "run all tasks" on the whole spec: it ignores workstream ownership.
- **Agent hooks (optional; A sets these up in Phase 0 if quick):** "on save of `lib/**/*.ts` → run `npm test`". Skip it if setup takes more than 5 minutes.

## Claude Code inside Kiro

```bash
claude                      # from the repo root, in Kiro's terminal
> /ponytail lite            # if Ponytail is installed (see below)
> Implement step B1.2 from context/phases/phase-1-core-loop.md. Follow AGENTS.md. Only edit the files that step lists.
```

- Use one Claude Code session per step. Run `/clear` between steps so old context doesn't leak.
- For A's money and state steps, ask for a plan first: "Plan step A2.2, then wait."

## Codex (D's laptop)

```bash
codex                       # from the repo root
> Implement step D1.3 from context/phases/phase-1-core-loop.md. Follow AGENTS.md. Only edit the files that step lists.
```

- Approve `npm run typecheck` / `npm test` / `npm run dev` when asked. Deny any `npm install <pkg>`.
- Codex reads `AGENTS.md` at the repo root automatically, so don't paste it in.

## Ponytail (optional; "smallest correct solution" ruleset)

Ponytail tells an agent to look for an existing or native solution before writing new code, and to keep code minimal. It's a good fit for a 5-hour build if it can't delete things the spec requires. AGENTS.md already tells it which things are required.

**Install** (only from `github.com/DietrichGebert/ponytail` or npm `@dietrichgebert/ponytail`):

| Tool | Install | Mode for this build |
|---|---|---|
| Claude Code | `/plugin marketplace add DietrichGebert/ponytail`, then in a separate prompt `/plugin install ponytail@ponytail`; start a new session | `/ponytail lite` |
| Codex CLI | `codex plugin marketplace add DietrichGebert/ponytail`, then `codex plugin add ponytail@ponytail`; open `/hooks` and trust its two hooks; start a new thread | `@ponytail lite` |
| Kiro | Copy `.kiro/steering/ponytail.md` from the Ponytail repo into our `.kiro/steering/` | Change its front matter to `inclusion: manual` and invoke it with `#ponytail` only when you want it |

The Claude Code and Codex hooks need `node` on your PATH.

**Use it like this:**

- **lite** mode while building. It builds what the step asks and only *mentions* smaller alternatives.
- Run `/ponytail-review` (Claude Code) or `@ponytail-review` (Codex) on your diff before each checkpoint. It's read-only and lists what could be simplified.
- **Reject** any suggestion that removes these (all required by AGENTS.md):
    - Zod validation
    - `requireUser`
    - `transition()` or `sauda_events`
    - tests
    - RTL or accessibility
    - DEMO / ILLUSTRATIVE labels
    - read-back confirmation
    - the fixtures
- Don't run `ponytail-audit` mid-build. It suggests repo-wide deletions; save it for after the hackathon.
- Deliberate shortcuts get `// ponytail:` comments. After the hackathon, `@ponytail-debt` lists them.

## Prompt templates

**Implement a step**

```
Implement step <ID> from context/phases/<phase-file>.md.
Follow AGENTS.md. Read the step's "Read first" files before coding.
Edit only the files listed under the step's "Files". Do not add dependencies or change contracts.
When done: run npm run typecheck && npm test, then report files changed, checks run, and anything skipped or assumed.
```

**Fix a failing check**

```
`npm run typecheck` fails with:
<paste error>
Fix it within the files owned by workstream <X> (AGENTS.md). If the fix needs a change to a contract file, stop and write a CONTRACT CHANGE REQUEST instead.
```

**Review before a checkpoint**

```
Review my branch diff against main for: edits outside workstream <X>'s folders; money computed outside lib/settle.ts or lib/net.ts;
status changed outside lib/transition.ts; missing requireUser/Zod; any import of lib/db, lib/queries or lib/session in a 'use client' file;
secrets with NEXT_PUBLIC_. List findings only; don't change code.
```

**Contract change request** (paste in team chat)

```
CONTRACT CHANGE REQUEST
File: <path>
Change: <exact addition>
Why: <step id + reason>
```
