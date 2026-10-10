---
inclusion: always
---
# Tech: Pakka Sauda

- **Framework:** Next.js 15, App Router, TypeScript strict. Use `npm`.
    - In Next 15, `cookies()` and `headers()` are async (`await cookies()`).
    - Route params are async: `{ params }: { params: Promise<{ id: string }> }`, then `const { id } = await params`.
- **UI:** Tailwind CSS v4 + shadcn/ui (components pre-installed in `components/ui`). Farmer font: Noto Nastaliq Urdu via `next/font/google`, loaded in `app/f/layout.tsx`.
- **Database:** Supabase Postgres, accessed only from the server with the service-role key via `lib/db.ts` (`@supabase/supabase-js`). No Supabase Auth, no client-side Supabase.
- **Auth:** a demo cookie (`ps_uid`, `ps_role`) set by the choose-user screen. Use `requireUser(role)` from `lib/session.ts`. `middleware.ts` guards route prefixes.
- **Writes:** server actions in `app/actions/*.ts`. Each one:
    - calls `'use server'`;
    - calls `requireUser`;
    - parses input with a Zod schema;
    - returns `ActionResult` via `run()`;
    - calls `revalidatePath`.
- **Reads:** async functions in `lib/queries.ts`, called from server components. Coerce `numeric` columns with `toNum` / `toNumOrNull`.
- **Live updates:** `<AutoRefresh seconds={3} />` (calls `router.refresh()`). No websockets.
- **Voice:**
    - Fixed prompts are MP3s in `public/audio/ur/` (generated with Uplift AI).
    - Dynamic sentences come from `lib/voice/phrases.ts`, sent to `GET /api/voice/tts?text=` (Uplift AI, cached).
    - Speech-to-text uses `POST /api/voice/stt` (Uplift Scribe) or the browser Web Speech API (`ur-PK`), whichever won the phone test.
    - The transcript goes to `POST /api/voice/extract` (deterministic parser first, Claude as fallback).
- **Tests:** Vitest for pure logic (`lib/**/*.test.ts`).
- **Env vars:** see `context/setup/env.example`. Server-only secrets never get the `NEXT_PUBLIC_` prefix.
- **Hosting:** Vercel. Every push to a `ws/*` branch gets a preview URL; `main` is production.
