# Design: Pakka Sauda MVP

This spec is a thin index. The design is already written down. Don't regenerate it; read these files:

| Topic | File |
|---|---|
| Product, users, decisions, real vs simulated | `context/project/01-product.md` |
| Rules, settlement formula, cancel rules, evidence | `context/project/02-business-rules.md` |
| Schema, functions, seed scenario | `context/project/03-data-model.md`, `supabase/schema.sql`, `supabase/seed.sql` |
| **Frozen contracts:** types, queries, actions, routes, components, voice API, env, errors | `context/project/04-contracts.md` |
| Farmer screens F1–F11 | `context/project/05-farmer-ui.md`, `.kiro/steering/farmer-ui.md` |
| Wholesaler and admin screens | `context/project/06-buyer-admin-ui.md` |
| Voice architecture | `context/project/07-voice.md` |
| Demo and rehearsal | `context/project/08-demo-and-rehearsal.md` |

## Architecture in one picture

```
Phone (farmer, /f/**, Urdu RTL)          Laptop (wholesaler /market /saudas /bids, admin /admin)
        │  server components (reads: lib/queries.ts)  +  server actions (writes: app/actions/*.ts)
        ▼
Next.js 15 on Vercel ── lib/settle.ts (money) ── lib/sauda-machine.ts + lib/transition.ts (state + audit)
        │                                     └─ lib/rules.ts (bid validation), lib/net.ts (farmer comparison)
        ├─ /api/voice/tts  → Uplift AI TTS (cached)        ├─ /api/voice/stt → Uplift Scribe (or browser Web Speech)
        └─ /api/voice/extract → parseUrduNumber() → Claude fallback (text only)
        ▼
Supabase Postgres (service role, RLS on with no policies) + Storage bucket "evidence"
   accept_bid() = atomic accept · reset_demo() = rehearsal reset
```

## Key design decisions

- **Pure core plus thin I/O.** All money and state rules are pure TypeScript with 48 unit tests. Actions are thin wrappers: auth, then Zod, then the rule, then the database, then an event.
- **Optimistic locking** on status (`update … where status = previous`) instead of database locks.
- **Polling** (`router.refresh()` every 3 s) instead of realtime infrastructure.
- **Parallel-safe:**
    - disjoint folder ownership per workstream;
    - contracts frozen at `contracts-v1`;
    - fixture-backed stubs from minute 20;
    - one dependency install.
