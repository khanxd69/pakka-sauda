# 08: Demo and rehearsal

The demo is one deal, listing to settlement, plus a 30-second dispute. It runs live on a **real Android phone** (farmer) and a **laptop** (wholesaler and admin). A backup video is recorded at 4:30.

## Devices and tabs

| Device | Tab | Signed in as |
|---|---|---|
| Phone (Chrome) | Production URL | Rashid |
| Laptop tab 1 | Production URL | Imran Traders |
| Laptop tab 2 (incognito) | Production URL | Lahore Fresh |
| Laptop tab 3 (another incognito window or browser) | Production URL | Reviewer |

The demo cookies are per browser profile, so use separate profiles or incognito windows for each laptop role.

## Before you present

1. Admin → **Reset demo** (or run `select reset_demo();`).
2. Check that the reference price card shows today's AMIS numbers, or says ILLUSTRATIVE.
3. Phone volume up, screen brightness up, auto-lock off. Tap the Rashid card once (this unlocks audio).
4. Hotspot ready in case the venue Wi-Fi fails. The backup video is on the presenter's laptop.

## Script (3 minutes; adjust to your slot)

| Time | Screen | Action | Say |
|---|---|---|---|
| 0:00–0:25 | Slide | n/a | "Rashid has 10,000 kg of potatoes and one buyer, and the grade 'drops' when the truck arrives. His arhti also gives him credit, so he isn't the villain." |
| 0:25–1:05 | Phone | Sell → potato → say "das hazar kilo" (or tap the pad) → next week → grade A → say "pandra sau bees" (1,520 per mann) → hear the read-back → ✓ | "He never reads a word. Every number is read back before it counts." |
| 1:05–1:35 | Laptop | Imran: Market → Rashid's listing → ladder A 45, B 39, C not accepted → Place bid. Lahore Fresh: A 44, B 40, C 32. | "Buyers bid a price for each grade, so the price for a lower grade is agreed before anyone sees the crop." |
| 1:35–2:00 | Phone | Offers → tap 🔊 on Imran's offer → shows "what reaches your hand" vs mandi → Accept → ✓ | "Then the Sauda card locks the terms." |
| 2:00–2:15 | Laptop | Imran: My saudas → Pay token (DEMO) → collection form: 9,200 kg, grade B (+ photo, P1) → Submit | "At the farm the buyer records weight and grade." |
| 2:15–2:25 | Phone | Hears "9,200 kilo, grade B, Rs 3,58,800…" → ✓ → "paise mil gaye?" → ✓ → settled | "Paid by rule: kilos times the agreed price for that grade." |
| 2:25–2:45 | Phone + laptop | Rashid: My saudas → the seeded deal (recorded as C) → ✗ "grade galat hai" → picks B. Reviewer tab: Disputes → evidence → rule B → Rs 2,40,000 becomes Rs 3,12,000. | "If they disagree, the crop stays with the farmer and a person decides from evidence, not the AI." |
| 2:45–3:00 | Laptop + slide | Admin tiles: settled value and fee revenue. Then the real-vs-simulated slide. | "1% from the buyer on settled deals. The farmer pays nothing. *Pakka sauda.*" |

## Five slides (D owns `pitch/`)

1. **Problem:** Rashid's story, plus one sourced fact (PIDE: arhtis provide credit and charge 2–4% commission).
2. **Why listings aren't enough:** the deal breaks at the farm gate over grade, weight and no-shows. Never claim another platform failed.
3. **Live demo.**
4. **Business model:** a 1% fee from the buyer on settled deals; the farmer pays nothing. First market: Okara potatoes to Lahore buyers. Only quote a market size you can source.
5. **Real vs simulated, and the pilot:**
    - **Measure:** time to list, % of voice fields corrected, % of saudas settled, dispute rate, farmer net vs his usual route.
    - **Next:** a payment partner, assessors, Punjabi and Saraiki, pre-harvest contracts.

## Judges' questions (short answers)

| They ask | Answer |
|---|---|
| Different from AgriConnect / Kissan Market? | They help you find a buyer; we lock the terms and settle them at the farm gate by rule. |
| Why leave the arhti? | We don't ask him to. We're one more buyer channel. Farmers tied by loans are hardest, so we start with those who already sell at the farm gate. |
| Bypass after the first deal? | The protection (token, ladder, dispute review, record) only exists on the platform. We'll measure repeat rate. |
| Urdu speech is unreliable. | Every number is read back and confirmed, and tapping always works. |
| What if the photo is fake? | Photos only back up what both people saw. Live camera, a one-time code, time and location stamps, and nothing is loaded until the farmer agrees. Pilot: in-person assessors. |
| Who holds the money? | Nobody, in the demo. A pilot needs a licensed payment partner and legal review. |
| Where's the AI? | It listens and explains in Urdu. It deliberately doesn't decide who gets paid. |

## Rehearsal checklist (Phase 4)

- [ ] Full script twice on the production URL, from a reset.
- [ ] The dispute scene works after the live deal (the seeded sauda `…3001` is Rashid's).
- [ ] Airplane-mode test on the phone mid-flow: errors play `error_generic` and nothing crashes.
- [ ] Backup screen recording of one clean run, about 3 minutes.
- [ ] One person times the demo; cut lines, not features.
