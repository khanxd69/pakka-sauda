# 01: Product

**Pakka Sauda** is an Urdu voice-guided harvest marketplace. The deal terms are locked before the truck arrives, and they still hold when it does. Hackathon track: **Retail & Commerce**.

## The problem we show

1. A potato farmer in Okara usually has one or two buyers.
2. He can't easily compare offers.
3. The deal often changes at the farm gate ("the grade is B now", "the weight is less").

The *arhti* (commission agent) also provides him credit, so we never cast the arhti as the villain. We offer another buyer channel with rules that protect both sides. A [PIDE study](https://file.pide.org.pk/uploads/kb-069-the-role-of-arthi-in-agriculture-marketing-an-exploiter-or-facilitator-of-farmers.pdf) reports arhti commission of 2–4% and describes credit tied to selling through the lender.

## Users

| User | Device | What they need |
|---|---|---|
| **Farmer** (Rashid, Okara) | Cheap Android phone, Chrome, weak network | To list and decide without reading; to hear offers; to be sure what he will be paid |
| **Wholesaler** (Imran Traders, Lahore) | Laptop or phone | To find supply, bid with clear quality terms, and record collection fairly |
| **Reviewer / admin** | Laptop | To settle grade disputes from evidence; to see deal value and fee revenue |

## The one deal (demo spine)

1. **List.** Rashid hears Urdu prompts and taps or speaks: crop (potato), quantity (one estimate, which becomes a ±10% range), ready when, quality, minimum price per mann. Then he hears the read-back and confirms.
2. **Bid.** Imran and Lahore Fresh each bid a **grade-price ladder**: Rs/kg for A and B, and for C or "not accepted". Each bid also sets a collection date and who pays loading.
3. **Hear offers.** Each offer is spoken in Urdu, with "what reaches your hand" compared against taking the crop to the mandi yourself.
4. **Accept.** The bid becomes a **sauda** with frozen terms. The token is 10% of the mid-range value at the expected grade's price (simulated, with a DEMO badge).
5. **Collect.** The buyer records the weighed kg, the grade and a photo (the photo shows a one-time code; P1). The farmer hears: *"9,200 kg, grade B, Rs 3,58,800; token 45,000 received, balance 3,13,800."*
6. **Confirm or dispute.**
    - If the farmer confirms, the sauda is **agreed**. The buyer pays the balance offline, the farmer taps "received", and the sauda is **settled**. The 1% fee is recorded.
    - If the farmer disputes, the sauda is **disputed** and the crop stays with the farmer. The reviewer compares the evidence and rules a grade, and the amount is recalculated.
7. **Admin** sees the settled value and the fee revenue.

## Locked decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Sale timing | Near harvest: ready within 0–14 days. Contracts months ahead are roadmap only. |
| 2 | Crop / place | Potatoes, Okara district; buyers in Lahore |
| 3 | Quantity | A range; payment on the **weighed kg** |
| 4 | Price | A fixed Rs/kg **per grade** (the ladder), set in the bid |
| 5 | Grades (illustrative) | A = large, firm, ≤5% damaged; B = medium or 5–10% damaged; C = small or >10% damaged |
| 6 | Token | 10% of mid-range value; pay within 30 min (configurable); simulated |
| 7 | Logistics | Farmer harvests; buyer collects and transports. "Who pays loading" is a term. |
| 8 | Fee | 1% of the settled amount, paid by the buyer |
| 9 | Login | Seeded demo users behind a "choose user" screen |
| 10 | Disputes | Grade agreed face to face before loading. If disputed, the crop stays with the farmer and the admin rules from both sides' photos. |
| 11 | Price reference | AMIS Punjab potato rates for Lahore and Okara, copied by hand on the day with date and unit |

## Real vs simulated (also the honesty slide)

| Part | Demo | Pilot |
|---|---|---|
| Urdu voice | **Real:** Uplift AI voice, prompts pre-generated, numbers spoken live | Add Punjabi and Saraiki |
| Speech recognition | **Real:** Uplift Scribe or the browser (whichever wins the phone test), with a tap fallback | Measure accuracy on farmers' own speech |
| Price reference | **Real** AMIS figures, dated, entered by hand | Fetched daily |
| Buyer verification | Seeded flag set by the admin | Documented checks |
| Token and payment | **Simulated**, DEMO badge | Licensed payment partner; escrow terms still to confirm |
| Weighing / grading | Buyer enters weight, grade and photo; farmer confirms | Plus a neutral assessor for disputes |
| Dispute review | Admin reviews live-camera photos with the one-time code | Reviewers, plus in-person assessors for high-value or conflicting cases |
| Fee | Calculated and shown | Invoiced |

## Out of scope (don't build)

Real payments, SMS, maps, signup, real-time infrastructure, more crops, pre-harvest contracts, logistics, credit, and AI yield prediction.
