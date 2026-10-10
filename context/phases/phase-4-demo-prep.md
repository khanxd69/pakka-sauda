# Phase 4: Demo prep (4:15 → 5:00)

**Goal:** a demo that has been run twice from a reset on production, a backup video, and the final slides. **No new features.** Only fix bugs that break the demo script, and only on the owner's branch, with A merging.

| Time | Who | What |
|---|---|---|
| 4:15–4:20 | A | Freeze merge. Production deploy. `select reset_demo();` Post the production URL. |
| 4:20–4:30 | Everyone | **Rehearsal 1**, following `context/project/08-demo-and-rehearsal.md`. D presents, C drives the phone, A and B run the laptop tabs. Log glitches with an owner. |
| 4:30–4:40 | Owners | Fix only the glitches that break the script (10-minute cap each). Everyone else: B records the backup video of a clean run (screen recording on laptop and phone). |
| 4:40–4:50 | Everyone | Reset. **Rehearsal 2**, timed. Cut lines, not features, to fit the slot. |
| 4:50–5:00 | D | Final slides and Q&A prep: read the judges' questions table aloud once. |
| 4:50–5:00 | C | Phone ready: volume, brightness, auto-lock off, signed in as Rashid, audio unlocked by one tap. |
| 4:50–5:00 | A | Final `reset_demo()`. Hotspot on standby. Close every terminal that might push. |

## Demo-breaking bug rules

- The owner fixes it on their branch. A merges it after `typecheck`, `test` and `build`.
- If a fix isn't safe in 10 minutes, **work around it in the script** instead. For example, use the number pad instead of the mic, or pre-place a bid before presenting.
- Never run `reset_demo()` while someone else is mid-rehearsal.

## If something fails live

| Failure | Fallback |
|---|---|
| Mic misunderstands | Say "tapping works too" and use the number pad. This shows the safety design. |
| Uplift voice fails | `SpeakButton` falls back to the browser voice; the numbers are on screen anyway. |
| Venue Wi-Fi | Switch the phone and laptop to the hotspot. |
| Production down | Play the backup video and narrate it. |
| A bug mid-flow | Switch to the seeded dispute sauda and show the dispute scene, then the admin tiles. |

## After the hackathon (not now)

- Run `@ponytail-debt` / `/ponytail-audit` to list shortcuts and removable code.
- Write down what the 2 phone interviews taught you in `context/project/01-product.md`.
- Pilot plan:
    - a licensed payment partner;
    - real assessors;
    - Punjabi and Saraiki prompts;
    - pre-harvest contracts;
    - measure farmer net vs his usual route.
