---
inclusion: always
---
# Structure: Pakka Sauda

```
app/
  page.tsx                 choose demo user (D)
  layout.tsx, globals.css  root shell (A)
  actions/*.ts             server actions, the only writes (A)
  api/voice/{tts,stt,extract}/route.ts   voice endpoints (C)
  f/**                     farmer app, Urdu RTL (B)
  market/**, saudas/**, bids/**          wholesaler dashboard (D)
  admin/**                 reviewer dashboard (D)
components/
  ui/**                    shadcn (A, Phase 0 only)
  shared/**                AutoRefresh, DemoBadge (A)
  voice/**, media/**       AudioPrompt, SpeakButton, VoiceNumberInput, CameraCapture (C)
  farmer/**                farmer-only components (B)
  buyer/**, admin/**       dashboard components (D)
lib/
  types.ts schemas.ts config.ts format.ts                  frozen contracts (A)
  settle.ts net.ts sauda-machine.ts rules.ts               frozen pure logic + tests (A)
  db.ts session.ts queries.ts transition.ts fixtures.ts    server/data (A)
  voice/**                 clips, phrases, number parsing, extraction (C)
supabase/                  schema.sql, seed.sql, storage.sql, seed-prices.sql (D), patches/ (A)
public/audio/ur/*.mp3      generated Urdu prompts (C)
scripts/generate-audio.mjs (C)
context/                   project docs, phases, setup, reference code (read only for agents)
```

- **Naming:** files are kebab-case; React components are PascalCase in `PascalCase.tsx`; server actions are camelCase verbs.
- **Ownership** is in `AGENTS.md`. Never edit outside your workstream.
- `context/reference/**` holds the Phase 0 source files that get copied into the repo. Don't import from `context/`.
