# CLAUDE.md: Pakka Sauda

@AGENTS.md

## Claude Code specifics

- Before writing code for a step, restate the step's **Files** and **Done when** lists. Ask if they are ambiguous.
- For steps that touch money or status (`lib/settle.ts`, `lib/transition.ts`, `app/actions/saudas.ts`, `app/actions/admin.ts`), make a short plan first and say which tests prove it.
- Finish every step by running `npm run typecheck && npm test`, then paste the summary lines.
- If Ponytail is installed, keep it in `lite` mode (`/ponytail lite`). Use `/ponytail-review` on your diff before committing; ignore its suggestions that conflict with AGENTS.md "Hard rules".
- Never run `git push --force`, `supabase db reset`, or any SQL against the shared database unless your step says so.
