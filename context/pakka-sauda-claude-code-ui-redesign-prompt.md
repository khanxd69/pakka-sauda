# Pakka Sauda: professional UI redesign prompt for Claude Code

Run this **after** the functional build works (end of Phase 2 or 3), on its own branch. It is a visual pass only: no business logic, schema, contract or dependency changes.

## How to launch

```bash
cd pakka-sauda
git checkout -b ui-redesign
claude                      # CLAUDE.md imports AGENTS.md automatically
> /plan                     # (or Shift+Tab to plan mode) so it audits before editing
```

Paste the prompt below. Review the plan it prints, approve it, then let it work step by step. Keep `npm run dev` open next to it and look at every screen at 360 px (farmer) and 1280 px (buyer/admin) after each step. Claude Code can't see the rendered page unless you share screenshots, so paste screenshots of any screen that looks wrong.

---

## THE PROMPT (paste into Claude Code)

````text
You are a senior product designer and front-end engineer. The Pakka Sauda MVP works, but its interface looks childish: toy-like colours, emoji tiles, oversized cartoonish buttons, inconsistent spacing, no real dashboards. Redesign every interface so it looks like a credible, modern fintech/agri-commerce product that a wholesaler's finance team, a hackathon judge and a farmer would all trust.

This is a PRESENTATION-ONLY pass. Read AGENTS.md, .kiro/steering/farmer-ui.md and context/project/05-farmer-ui.md and 06-buyer-admin-ui.md first. Then follow this prompt.

## 0. What is allowed and what is not

Allowed: className/markup/layout/styling changes in app/**/page.tsx, layouts, loading/error states, components/farmer|buyer|admin|voice|media|shared (visual only), app/globals.css, app/layout.tsx and app/f/layout.tsx (fonts and shell), new files under a NEW folder `components/design/**`, and `public/img/**` assets.

For this task only, the "edit only your workstream's files" rule is suspended for those presentational files. Everything else in AGENTS.md still applies.

Not allowed (stop and tell me instead):
- Any change to lib/** (types, schemas, config, settle, net, sauda-machine, rules, queries, transition, voice logic), app/actions/**, supabase/**, middleware.ts, route paths, status names, API shapes, clip IDs, component prop signatures in components/voice|media|shared.
- Adding any npm dependency or running `shadcn add`. Use what is installed: Tailwind v4, the shadcn components already in components/ui, `lucide-react` (confirm it is in package.json; if it is not, use inline SVG), and fonts via `next/font/google`.
- Changing any text meaning, number formatting, money calculation, Urdu string, or removing a safety feature. Keep every <DemoBadge />, every "ILLUSTRATIVE"/source+date label, every read-back/confirm screen, every requireUser path.
- Inventing data. Where a dashboard needs a number the queries don't provide, do not fake it: derive it in the server component from data the existing queries already return, or leave that tile out and tell me.
- Charts via a library (none is installed). Build sparklines, bars and progress rings with plain SVG/CSS.

## 1. Reference direction (do not copy code, assets, logos or copy text)

If you have web access, open these and study layout density, hierarchy and restraint; if not, use the written spec below.
- Stripe Dashboard (stripe.com/docs/dashboard): calm neutral surfaces, dense readable tables, status pills, KPI cards with small trend lines, a persistent left sidebar.
- Linear (linear.app): typographic restraint, subtle borders instead of heavy shadows, keyboard-friendly, almost no decoration.
- Vercel Dashboard (vercel.com/dashboard): clean card grids, clear empty states, quiet colour use.
- For the farmer mobile app: the clarity of a modern payments app (large confident numbers, one primary action, generous whitespace), not a children's app.

Result in one line: **quiet, neutral, precise; colour only where it carries meaning.**

## 2. Design system (build this first, in `app/globals.css` and `components/design/**`)

Tokens (CSS variables in globals.css, mapped into Tailwind v4 `@theme`; light mode only):
- Neutrals: slate scale. Page background #F8FAFB, surface #FFFFFF, subtle surface #F1F5F4, border #E4E9E7, strong border #CBD5D1, text #0F1A17, muted text #5B6B66.
- Brand: deep agricultural green. Primary #166534 (hover #14532D), primary-soft #E7F4EC. Use ONE accent for highlights: warm amber #B45309 on soft #FEF3C7, used sparingly (audio/attention), not as a button fill everywhere.
- Semantic: success #15803D, danger #B91C1C, warning #B45309, info #1D4ED8, each with a soft background tint and AA-contrast text. Keep the existing meaning: green = go, red = stop/dispute.
- Radius: 8 px controls, 12 px cards, 999 px pills. Shadows: none by default, one very soft `0 1px 2px rgba(16,24,20,.06)` on raised cards. Prefer 1 px borders.
- Spacing on a 4 px grid; page gutters 24 px desktop, 16 px mobile.
- Typography: Latin UI font Inter (or Geist) via next/font, tabular numbers (`font-variant-numeric: tabular-nums`) for every money/kg/price cell. Type scale: 12/13/14/16/20/24/32. Weights 400/500/600 only. Farmer screens keep Noto Nastaliq Urdu (line-height >= 1.9); numbers stay LTR.
- Icons: lucide-react (or inline SVG), 1.5 px stroke, consistent sizes. NO emoji anywhere in the UI.
- Motion: 150 ms ease-out on hover/focus/press only. Respect prefers-reduced-motion. No bouncing, confetti, gradients-as-decoration, or glassmorphism.
- Focus: visible 2 px ring on every interactive element. WCAG AA contrast everywhere.

Create these reusable primitives in `components/design/` (server components unless they need interactivity):
`PageHeader` (title, description, actions, breadcrumb), `StatCard` (label, value, delta/sub-text, optional SVG sparkline), `StatusPill` (maps every SaudaStatus/BidStatus/ListingStatus to a label + tone, using STATUS_LABEL from lib/sauda-machine for text), `DataTable` wrapper styles (sticky header, zebra off, row hover, right-aligned numeric columns), `EmptyState` (icon, title, one action), `Section`/`Card`, `KeyValueList`, `Stepper` (sauda lifecycle: token due -> awaiting collection -> collected -> agreed -> settled), `Timeline` (for sauda_events), `MoneyCell` (formatRs, tabular, with optional DemoBadge), `Avatar` (initials, no photos), `AppShell` (sidebar + top bar + content), `MobileTabBar`.
Also update rules 4 and 10 of .kiro/steering/farmer-ui.md so they describe the new visual language (no emoji tiles; refined colours) and leave every other rule untouched.

## 3. Screens to redesign

Do an inventory first: list every page.tsx, layout.tsx and component in app/** and components/** and the role each serves. Then redesign them all, using this brief.

### 3.1 Landing / choose-user (`/`)
Currently a toy picker. Make it a polished role-selection screen: brand mark and wordmark "Pakka Sauda", one-line value statement, three role cards (Farmer, Wholesaler, Admin) each with an icon, one-line description and the seeded identities listed as clean rows with name, place/company and a "Verified" or "Unverified" pill for wholesalers. A subtle "Demo environment: simulated payments" note using the existing DemoBadge. No illustration clutter.

### 3.2 Wholesaler app (`/market`, `/market/[id]`, `/bids`, `/saudas`, `/saudas/[id]`)
- AppShell with a left sidebar (Market, My bids, My saudas) and a top bar showing the user (avatar, name, Verified pill) and role switch/logout.
- `/market`: filter bar (crop, ready date, quantity), results as a clean data table on desktop and cards on mobile: farmer, location, quantity range in kg, ready date, minimum price per kg, number of bids, "Place bid" action. Reference-price strip at the top with source and date (or ILLUSTRATIVE).
- `/market/[id]`: two columns. Left: listing summary and farmer's terms. Right: sticky BidForm card with the A/B/C price ladder as three aligned inputs, collection date, loading-paid-by, and the live preview panel (token, expected value) as a quiet summary box with MoneyCell rows. Validation messages inline, using the existing BID_ERROR_TEXT.
- `/bids`: table with status pills and withdraw action.
- `/saudas` list: table with a compact lifecycle indicator per row. `/saudas/[id]`: header with StatusPill and total, `Stepper` across the lifecycle, terms card (frozen price ladder), token card, collection form with settle preview, and a `Timeline` of events. Show the settlement maths as a clear breakdown table (weighed kg x price = final amount, fee, balance, buyer pays) using the values the existing code already computes.

### 3.3 Admin app (`/admin`, `/admin/disputes/[id]`, `/admin/users`)
- AppShell with sidebar (Overview, Disputes, Users) and a Reset-demo action tucked in an overflow menu with a confirmation dialog.
- `/admin` dashboard: row of StatCards (settled value, fee revenue, active listings, open sauda count, open disputes, verified buyers), only those the existing AdminStats/queries support. Below: a "Recent saudas" table and a "Needs attention" list (disputes first). Small SVG sparkline/bar only where real data supports it.
- `/admin/disputes/[id]`: header with sauda summary; side-by-side evidence (buyer's photos and farmer's photos in equal framed panels with timestamp, location stamp and the collection code visible); the claimed grade vs the price ladder; a ruling panel (radio group: grade A/B/C/not accepted/unresolved) with the recalculated amount preview and a confirm dialog.
- `/admin/users`: table of profiles with role pills, a Verified toggle for wholesalers, and counts.

### 3.4 Farmer app (`/f/**`), Urdu RTL, audio first
Keep EVERY functional rule in farmer-ui.md: one question per screen, audio first with replay button, max two primary actions, 56 px+ targets, RTL, numbers huge and LTR, read-back before commit, 360 px first. Change only the look:
- Replace emoji tiles with a restrained flat illustration set (simple inline SVG or the real photos in public/img if present; muted greens, earth and neutral tones) and lucide icons.
- Calm off-white background, white cards with 1 px borders, no saturated full-bleed colour blocks. Primary action: solid deep green; secondary: outlined; destructive: outlined red. Audio button: a refined pill with a speaker icon and waveform animation while playing (amber-soft, not a loud amber block).
- A slim step indicator at the top of the sell wizard (F2-F6 as segments). Big confident numbers for quantity and prices, with the unit as small muted text beside them.
- Offers screen (F8): each offer is a card with buyer name + Verified pill, the per-grade price ladder as a neat three-row table, and the "what reaches your hand" comparison as two clear numbers (offer vs mandi) with a simple SVG bar; keep ILLUSTRATIVE costs labelled.
- Sauda cards (F9-F11): large status header, the lifecycle Stepper in a mobile-friendly vertical form, amounts in big tabular numerals, and the collection code displayed in a bordered, high-contrast box.
- A bottom action bar pinned with safe-area padding. Use skeleton loading and a calm empty state ("no listings yet") with the same Urdu strings as before.

## 4. Quality bars (check each before finishing a step)
1. Consistent: every page uses the same shell, headings, spacing, table style and pill style.
2. Responsive: buyer and admin work from 360 px to 1440 px (tables become cards on mobile or scroll inside their own container; no body horizontal scroll). Farmer screens verified at 360 px.
3. Accessible: AA contrast, visible focus, labels on every input, aria on icon-only buttons, `dir="rtl" lang="ur"` intact on /f.
4. States: loading skeletons, empty states, error states and disabled states exist for every data view and every button.
5. No layout shift from fonts; no unused CSS; no inline hard-coded hex values in components (tokens only).
6. `npm run typecheck && npm test && npm run lint && npm run build` pass, with the same number of tests as before.

## 5. How to work
1. FIRST reply with: (a) the inventory of pages and components, (b) what looks childish on each, (c) your plan in numbered steps (below), (d) any query/data gap you found for the dashboards. Wait for my OK.
2. Steps, one at a time, each committed as `[UI-n] <what changed>` on branch `ui-redesign`:
   - UI-1 design tokens, fonts, globals.css
   - UI-2 components/design primitives (+ a throwaway `/design-check` page I can open, deleted at the end)
   - UI-3 landing / choose-user
   - UI-4 wholesaler shell and /market pages
   - UI-5 /saudas pages and collection/settle UI
   - UI-6 admin shell, dashboard, users
   - UI-7 admin dispute review
   - UI-8 farmer layout, wizard (F2-F7)
   - UI-9 farmer offers and sauda cards (F8-F11)
   - UI-10 polish: empty/loading/error states, responsive pass, remove /design-check, update farmer-ui.md rules 4 and 10
3. After each step print: files changed, what the screen now looks like (3 lines), checks run with results, and anything I should look at in the browser. Do not start the next step until I say "next".
4. If something needs a change in a forbidden file, print:
   CONTRACT CHANGE REQUEST / File / Change / Why
   and continue with the rest.
5. Never touch money logic or status logic. If you are unsure whether an edit changes behaviour, don't make it and ask.

Begin with the inventory and plan.
````

---

## Optional shorter follow-ups

**Fix one screen that still looks off**
```text
The screen at <route> still looks unprofessional: <what you see>. Using the existing design tokens and components/design primitives only, redesign it. Presentation only; no logic, props or text changes. Run typecheck, test and build, and tell me what to check at 360 px and 1280 px.
```

**Consistency audit (read-only)**
```text
Audit every page under app/** against the design system: list any hard-coded colours, emoji, inconsistent spacing, missing loading/empty/error states, missing focus styles, or screens that scroll horizontally at 360 px. Findings only; do not change code.
```
