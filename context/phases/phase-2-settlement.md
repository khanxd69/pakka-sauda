# Phase 2: Collection, settlement, dispute, admin (1:45 → 3:30)

**Goal:** the whole deal works on production, including the dispute scene:

1. The buyer records the weight and grade.
2. The farmer hears the amount and confirms, or disputes.
3. The reviewer rules.
4. The farmer confirms the balance was received, and the sauda is settled.
5. The admin tiles show the settled value and the fee.

**Checkpoint 2 at 3:30.** Every P0 box in `context/project/04-contracts.md` works. Smoke test at the end of this file.

---

## Workstream A

### A2.1: Checkpoint 1 fixes (15-minute cap)

- **P0** · 15 min
- **Files:** A's files only
- **Do:** fix anything in A's code that failed the Checkpoint 1 smoke test. If nothing failed, start A2.2.
- **Done when:** the Checkpoint 1 smoke test passes on production.

### A2.2: `recordCollection` (**unblocks** D2.1)

- **P0** · 20 min · **Depends on:** A1.6
- **Read first:** `02-business-rules.md` (formula, rules table), `lib/settle.ts`, `.kiro/steering/money-and-state.md`
- **Files:** `app/actions/saudas.ts`
- **Do:**
    1. `requireUser('wholesaler')`, then parse with `RecordCollectionSchema`.
    2. `const s = await loadSauda(id)`, then `const r = settle(s.terms, weighedKg, grade)`.
    3. Call `applyTransition({ action: 'recordCollection', to: 'collected', patch: { weighed_kg, delivered_grade: grade, buyer_note: note ?? null, final_amount: r.outcome === 'payable' ? r.finalAmount : null, platform_fee: r.outcome === 'payable' ? r.fee : null }, event: 'collected', payload: { weighed_kg, grade, outcome: r.outcome } })`.
- **Done when:**
    - recording 9,200 kg B on a sauda with ladder 45/39/null stores `final_amount` 358800 and `platform_fee` 3588;
    - recording grade C stores nulls and outcome `grade_not_accepted`;
    - recording twice returns `BAD_TRANSITION`.

### A2.3: `farmerConfirm` and `farmerDispute` (**unblocks** B2.1, B2.2)

- **P0** · 20 min · **Depends on:** A2.2
- **Files:** `app/actions/saudas.ts`
- **Do:**
    - **farmerConfirm:**
        1. `requireUser('farmer')`, then `loadSauda`.
        2. `const to = statusAfterGrade(s.terms, s.weighed_kg!, s.delivered_grade!)`.
        3. If `agreed`: `applyTransition({ action: 'farmerConfirm', to: 'agreed', patch: { agreed_at: now }, event: 'confirmed' })`.
        4. Else: `applyCancel({ saudaId, reason: 'grade_not_accepted', actor: user })`.
        5. Return `{ status }`.
    - **farmerDispute:**
        1. Parse with `FarmerDisputeSchema`.
        2. `applyTransition({ action: 'farmerDispute', to: 'disputed', patch: { farmer_claimed_grade: claimedGrade, dispute_reason: reason ?? null }, event: 'disputed', payload: { claimedGrade } })`.
- **Done when:** on the seeded sauda `…3001` (collected, C at 30), confirm → `agreed`. After a `reset_demo()`, dispute B → `disputed` with the claimed grade stored.

### A2.4: `confirmBalanceReceived` (**unblocks** B2.3)

- **P0** · 10 min · **Depends on:** A2.3
- **Files:** `app/actions/saudas.ts`
- **Do:** `requireUser('farmer')`, then `applyTransition({ action: 'confirmBalanceReceived', to: 'settled', patch: { settled_at: now }, event: 'balance_received' })`.
- **Done when:** an `agreed` sauda becomes `settled`; `getAdminStats().settled_value` grows by its `final_amount`.

### A2.5: `resolveDispute` (**unblocks** D2.4)

- **P0** · 20 min · **Depends on:** A2.3
- **Files:** `app/actions/admin.ts`
- **Do:**
    1. `requireUser('admin')`, then parse with `ResolveDisputeSchema`, then `loadSauda`.
    2. `const r = settle(s.terms, s.weighed_kg!, grade)`.
    3. If `r.outcome === 'payable'`: `applyTransition({ action: 'resolveDispute', to: 'agreed', patch: { resolved_grade: grade, resolution_note: note, final_amount: r.finalAmount, platform_fee: r.fee, agreed_at: now }, event: 'resolved', payload: { grade } })`.
    4. Else: `applyCancel({ reason: 'grade_not_accepted', actor: user, note })`, then a plain update of `resolved_grade` and `resolution_note` (no status change).
    5. Return `{ status }`.
- **Done when:** the seeded dispute, ruled B, ends `agreed` with `final_amount` 312000 and a `resolved` event.

### A2.6: `cancelSauda` (code path for every reason)

- **P0** (code) / P1 (UI) · 15 min · **Depends on:** A1.6
- **Files:** `app/actions/saudas.ts`
- **Do:**
    1. `const user = await requireUser()` (any role), then parse with `CancelSaudaSchema`.
    2. If `reason === 'shortfall'`, load the sauda and require `isShortfall(s.terms, s.weighed_kg!)`, else throw `NOT_A_SHORTFALL`.
    3. Call `applyCancel({ saudaId, reason, actor: user })`. Roles and token destination come from `CANCEL_RULES`.
- **Done when:** `buyer_walked_away` from `awaiting_collection` gives `token_to = 'farmer'`; a farmer trying `shortfall` gets `ROLE_NOT_ALLOWED`.

---

## Workstream B

### B2.1: F10 collection confirm

- **P0** · 30 min · **Depends on:** B1.6; A2.3 for a real confirm
- **Read first:** 05-farmer-ui §F9–F11 (the `collected` row and the F10 block), `lib/voice/phrases.ts` (`explainCollection`)
- **Files:** `components/farmer/SaudaPanel.tsx`, `components/farmer/CollectionReview.tsx`
- **Do:**
    1. For status `collected`, compute `r = settle(terms, weighed_kg, delivered_grade)`.
    2. Play `collection_intro`, then `SpeakButton autoPlay text={explainCollection(r.outcome === 'payable' ? { kind: 'payable', … } : { kind: 'grade_not_accepted', … })}`.
    3. Show the weight (kg and mann), `GradeCard`, `MoneyBig` total, token received and balance. Then play `collection_choice`.
    4. ✓ **ٹھیک ہے** → `farmerConfirm`. ✗ **گریڈ غلط ہے** opens the dispute sheet (B2.2).
- **Done when:** as Rashid on the seeded sauda, you hear "8,000 kilo, grade C, Rs 2,40,000…" with the numbers matching the screen; ✓ moves it to `agreed`.

### B2.2: Dispute sheet and F10b (`disputed`)

- **P0** · 25 min · **Depends on:** B2.1; A2.3
- **Files:** `components/farmer/DisputeSheet.tsx`, `components/farmer/SaudaPanel.tsx`
- **Do:**
    1. The sheet plays `dispute_grade_ask` and shows three `GradeCard`s plus the reason chips. Submit calls `farmerDispute({ saudaId, claimedGrade, reason })`.
    2. The `disputed` panel plays `dispute_sent` and shows "your grade vs buyer's grade" side by side, with "the crop stays with you" in large Urdu.
- **Done when:** disputing the seeded sauda as B shows the F10b screen; the buyer's page (D) shows "Under review".

### B2.3: F11 balance received, settled and cancelled

- **P0** · 25 min · **Depends on:** B2.1; A2.4
- **Files:** `components/farmer/SaudaPanel.tsx`, `components/farmer/BalancePanel.tsx`, `components/farmer/SettledPanel.tsx`
- **Do:**
    - **`agreed`:**
        - if the sauda has `resolved_grade`, play `dispute_resolved` first;
        - `SpeakButton(askBalance(balance))` with `balance = final_amount − terms.token_amount`, and `MoneyBig` showing the balance with `DemoBadge`;
        - ✓ **مل گئے** → `confirmBalanceReceived`; ✗ just closes.
    - **`settled`:** the `settled` clip and a green summary.
    - **`cancelled`:** the reason in Urdu and where the token went (`token_to`):

        | `cancel_reason` | Show |
        |---|---|
        | `grade_not_accepted` | خریدار نے یہ گریڈ نہیں لیا |
        | `buyer_walked_away` | خریدار پیچھے ہٹ گیا، ٹوکن آپ کا ہے |
        | `token_expired` | ٹوکن وقت پر نہیں آیا |
        | others | سودا منسوخ |

- **Done when:** from `agreed`, tapping ✓ ends `settled` with the summary.

### B2.4: List and home polish

- **P0** · 15 min · **Depends on:** B1.2, B1.6
- **Files:** `app/f/page.tsx`, `app/f/saudas/page.tsx`, `components/farmer/HomeTiles.tsx`
- **Do:**
    - The home "my deals" count = saudas not settled or cancelled. Saudas that need the farmer (`collected`, `agreed`) get a pulsing badge.
    - The list sorts action-needed saudas first.
- **Done when:** after the buyer records a collection, the farmer's home pulses within 3 seconds.

---

## Workstream C

### C2.1: Finish and harden the mic (if C1.5 was cut short; 30-minute cap)

- **P0 attempt** · **Depends on:** C1.5
- **Files:** as in C1.5
- **Do:**
    - Handle permission denied: play `mic_retry` and keep the pad.
    - Add a 6-second auto-stop.
    - Show a "thinking" spinner. Put a 3-second timeout on the stt/extract calls, with the pad still working.
    - Enable the LLM fallback in `extract.ts` if `ANTHROPIC_API_KEY` is set.
- **Done when:** 8 of 10 test phrases fill the right number on the phone, or the mic is hidden and the decision is posted.

### C2.2: Voice on F9–F11 together with B

- **P0** · 30 min · **Depends on:** B2.1–B2.3
- **Files:** C's files only. B owns the screens; C fixes the components and phrases.
- **Do:** test every farmer screen on the phone:
    - each one autoplays the right clip after navigation;
    - dynamic sentences match the numbers on screen;
    - no two clips overlap.

  Fix phrase wording or add missing clips (additive: new IDs plus generated MP3s, then tell B).
- **Done when:** the whole farmer path from F1 to F11 is narrated correctly on the phone.

### C2.3: Offline and error audio

- **P1** · 15 min
- **Files:** `components/voice/useOnline.ts` (new), `components/voice/AudioPrompt.tsx`
- **Do:** export `useOnline()` (`navigator.onLine` plus events) so B can play `offline` and disable submits when offline. Make sure `AudioPrompt` never throws when a file is missing.
- **Done when:** in airplane mode a farmer screen shows the offline state, and nothing crashes.

---

## Workstream D

### D2.1: Collection form with settle preview

- **P0** · 35 min · **Depends on:** D1.5; A2.2 for a real write
- **Read first:** 06 (`/saudas/[id]` status panel), `lib/settle.ts`
- **Files:** `components/buyer/CollectionForm.tsx`, `components/buyer/SaudaActions.tsx`
- **Do:**
    - **Fields:** weighed kg, grade radio, note.
    - **Live preview** from `settle(terms, kg, grade)`: price/kg, total, token paid, balance at loading (if negative, show "farmer refunds Rs X"), fee, you pay.
    - **Unpriced grade:** a red note (text in 06).
    - **Shortfall hint:** if `isShortfall`, show "below 80% of the low estimate: you may cancel after recording".
    - Submit calls `recordCollection`. The photo is added in D3.1.
- **Done when:** for the live demo sauda, 9,200 kg B previews Rs 358,800 / balance 313,800 / fee 3,588 / you pay 362,388; submitting moves it to `collected`.

### D2.2: Status panels for the rest of the lifecycle

- **P0** · 20 min · **Depends on:** D2.1
- **Files:** `components/buyer/SaudaActions.tsx`
- **Do:** the `collected`, `disputed`, `agreed`, `settled` and `cancelled` panels as in 06. `DemoBadge` on `agreed`. Show the timeline under every panel.
- **Done when:** walking one sauda through to `settled` shows the right panel at each stage within 3 seconds of the farmer acting.

### D2.3: `/admin` dashboard

- **P0** · 25 min · **Depends on:** D1.1
- **Files:** `app/admin/layout.tsx`, `app/admin/page.tsx`, `components/admin/StatTiles.tsx`, `components/admin/DisputeQueue.tsx`
- **Do:** tiles from `getAdminStats()` (settled value and fee revenue big, in `formatRs`); a status count table; the disputes queue (`getDisputes()`); `<AutoRefresh />`.
- **Done when:** after a reset, settled value is Rs 228,800 and fee is Rs 2,288. After the live deal settles, the values grow by its amounts.

### D2.4: `/admin/disputes/[id]`: evidence and ruling

- **P0** · 30 min · **Depends on:** D2.3; A2.5 for a real ruling
- **Read first:** 06 (`/admin/disputes/[id]`), 02 (Evidence a reviewer can trust)
- **Files:** `app/admin/disputes/[id]/page.tsx`, `components/admin/EvidenceCompare.tsx`, `components/admin/RulingForm.tsx`
- **Do:**
    - **Side-by-side cards:** buyer's claim (grade, note, photos with time and location) vs farmer's claim (grade, reason, photos). Photos come in P1; show "no photos" for now.
    - **Also show:** the expected grade, the ladder, the weight and the collection code.
    - **RulingForm:** grade radio, a required note, and a live preview from `settle()` ("new amount Rs X, was Rs Y"). Submit calls `resolveDispute`, then redirects to `/admin`.
- **Done when:** ruling the seeded dispute as B shows Rs 312,000 (was Rs 240,000), and the sauda becomes `agreed`.

---

## Checkpoint 2 smoke test (the full demo, on production; 15 min)

1. `select reset_demo();` (announce it).
2. Run the **whole script** in `context/project/08-demo-and-rehearsal.md` once: phone + 2 laptop tabs + reviewer tab.
3. Check at each stage:
    - the money on the farmer's screen equals the buyer's screen equals the admin tiles;
    - the audio matches the numbers;
    - no screen needs a manual refresh.
4. Write down every glitch with its owner. Fixes happen in the first 15 minutes of Phase 3.

## Cut order if Phase 2 runs late

1. C2.3.
2. B2.4.
3. The D2.2 timeline (keep the panels).
4. The C2.1 hardening (hide the mic).

**Never cut:** A2.2–A2.5, B2.1–B2.3, D2.1, D2.3, D2.4.
