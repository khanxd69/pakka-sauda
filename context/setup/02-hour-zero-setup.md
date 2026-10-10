# Setup 2: Hour zero (the exact commands)

A runs part 1 at 0:00. B, C and D do part 3 (their own setup) at the same time, then part 4 when A says "pull now" (target **0:20**).

## Part 1: A creates the repo (0:00–0:20)

```bash
# 1. Scaffold. Next 15 is pinned on purpose: agents know its APIs well.
npx create-next-app@15 pakka-sauda --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --turbopack
cd pakka-sauda

# 2. ALL runtime and dev dependencies, now and only now (no one adds deps later)
npm i @supabase/supabase-js zod@^3.25 @anthropic-ai/sdk server-only
npm i -D vitest@^3

# 3. shadcn/ui: every component the team will need (no one runs `shadcn add` later)
npx shadcn@latest init -d
npx shadcn@latest add button card badge input label select dialog sheet table tabs sonner textarea separator skeleton radio-group checkbox switch alert progress
#  If npm complains about React 19 peer deps, accept the CLI's --legacy-peer-deps / --force option.

# 4. Copy this context pack into the repo root (AGENTS.md, CLAUDE.md, .kiro/, context/)
cp -r /path/to/pakka-sauda-context/. .

# 5. Copy the Phase 0 reference files into place (keeps the same relative paths)
cp -r context/reference/lib context/reference/app context/reference/components context/reference/supabase \
      context/reference/scripts context/reference/public context/reference/middleware.ts context/reference/vitest.config.mts .
cp context/setup/env.example .env.example
```

`package.json` scripts: add these, keeping the existing ones.

```json
"typecheck": "tsc --noEmit",
"test": "vitest run",
"gen:audio": "node scripts/generate-audio.mjs"
```

`tsconfig.json`: make sure `"resolveJsonModule": true` is set (create-next-app sets it). Add `"exclude": ["node_modules", "context"]` so the reference copies don't compile twice.

`.gitignore`: make sure `.env*.local` is listed (create-next-app adds it). Don't ignore `.env.example`.

`eslint.config.mjs`: add `"context/**"` to the ignores so the reference copies aren't linted twice.

`app/layout.tsx`: replace it with a minimal shell.

```tsx
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = { title: 'Pakka Sauda', description: 'Urdu voice-guided harvest marketplace (demo)' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
```

`app/page.tsx`: leave a one-line placeholder (`export default function Page() { return <main>Pakka Sauda</main>; }`). D replaces it in D1.1.

Check, then commit and tag:

```bash
npm run typecheck && npm test        # expect: 48 tests passed
npm run build                        # must succeed
git init && git add -A && git commit -m "[A0] scaffold + contracts-v1 + stubs"
git branch -M main
git remote add origin git@github.com:<you>/pakka-sauda.git
git push -u origin main
git tag contracts-v1 && git push origin contracts-v1
for b in ws/a-backend ws/b-farmer ws/c-voice ws/d-buyer; do git push origin main:$b; done
```

Post in team chat: **"pull now: contracts-v1 is on main and your branch exists."**

## Part 2: A sets up the database and deploy (0:20–0:35)

1. Supabase → SQL editor: run `supabase/schema.sql`, then `supabase/seed.sql`, `supabase/seed-prices.sql` and `supabase/storage.sql`.
2. Check with `select count(*) from profiles;`. Expect **7**.
3. Supabase → Settings → API: copy the URL and the **service_role** key into `.env.local`.
4. Share them privately with the team.
5. Vercel → Add New Project → import `pakka-sauda` → add every variable from `.env.example` (with real values) → Deploy.
6. Note the production URL. Each `ws/*` branch push also gets a preview URL.

## Part 3: B, C, D in parallel at 0:00 (no repo needed yet)

- **C:**
    - Uplift key: run one curl TTS call (`07-voice.md`).
    - Confirm the STT request format with one curl call and write it into `07-voice.md`.
    - Run `node context/reference/scripts/generate-audio.mjs` from a scratch copy if the MP3s aren't ready yet.
- **D:**
    - Open `amis.pk` and copy today's potato prices for Lahore and Okara into a local copy of `seed-prices.sql`, with the exact unit and date.
    - Codex laptop: install and sign in, and install Ponytail if you use it.
- **B:** sketch screens F1–F11 on paper from `05-farmer-ui.md`; prepare the images in `public/img/`.
- **Everyone:** open Kiro and set up Claude Code / Codex and Ponytail (`04-agent-tooling.md`).

## Part 4: everyone, after "pull now"

```bash
git clone git@github.com:<you>/pakka-sauda.git && cd pakka-sauda
git checkout ws/<your-letter>-<name>       # ws/b-farmer, ws/c-voice, ws/d-buyer
npm ci
cp .env.example .env.local                 # paste the values A shares privately
npm run typecheck && npm test && npm run dev
```

Open <http://localhost:3000>. The placeholder home page should load, and `/f` should redirect to `/` (no cookie yet).

The stubs serve fixture data, so you can build screens **before** the database is wired.
