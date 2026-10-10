# Phase 1: Core loop: list → bid → accept → token (0:35 → 1:45)

**Goal:** on production, Rashid lists by voice-guided screens, Imran bids with a ladder, Rashid hears the offer and accepts, and Imran pays the token (DEMO).

**Checkpoint 1 at 1:45.** A merges in the order A → C → B → D and runs the smoke test at the end of this file.

**Order inside each workstream matters.** Do the steps top to bottom. The steps marked **unblocks** let other workstreams move from stubs to real behaviour.

---

## Workstream A: backend and rules

### A1.1: Real read queries (**unblocks** B, D)

- **P0** · 30 min · **Depends on:** A0.6
- **Read first:** `context/project/04-contracts.md` §2, `context/project/03-data-model.md`, `lib/types.ts`, `lib/fixtures.ts` (expected shapes)
- **Files:** `lib/queries.ts`
- **Do:** replace every stub body with Supabase queries via `db()`. **Keep every signature and its documented semantics** (ordering, filters).
    - Joins with supabase-js select strings:
        - listings → `'*, farmer:profiles(id,name,name_ur,business_name,verified,district)'`;
        - bids → `'*, buyer:profiles(id,name,name_ur,business_name,verified,district), listing:listings(*)'`;
        - saudas have **two** foreign keys to profiles, so name them: `farmer:profiles!saudas_farmer_id_fkey(...)`, `buyer:profiles!saudas_wholesaler_id_fkey(...)`, `listing:listings(*)`.
    - `bid_count` = the number of **pending** bids per listing. Fetch the pending bids for the listing IDs in one query and count in JS.
    - `getOffersForFarmer`: pending bids whose listing is the farmer's and `open`. Filter after the join, or use `listing:listings!inner(*)` with `.eq('listing.farmer_id', id).eq('listing.status','open')`.
    - Coerce every `numeric` column with `toNum` / `toNumOrNull` (prices, kg, amounts) in one `mapListing` / `mapBid` / `mapSauda` helper each.
    - `getAdminStats`: count by status in JS from `select status, final_amount, platform_fee from saudas`. Profile counts by role.
    - Throw `Error('DB_ERROR:<message>')` on a Supabase error.
- **Done when:**
    - `npm run typecheck` passes.
    - Temporary check (delete afterwards): `/f` signed in as Rashid shows his data from the database, not fixtures. Insert a row in Supabase and see it appear.
    - The seeded sauda `…3001` loads with `terms.price.B === 39` as a number.

### A1.2: Login flow on real data

- **P0** · 5 min · **Depends on:** A1.1
- **Files:** `lib/session.ts`, `middleware.ts` (only if a fix is needed)
- **Do:**
    1. Confirm that `setDemoUser` with a database profile sets both cookies and redirects by role.
    2. Confirm the middleware bounces the wrong role (a farmer opening `/market` goes back to `/`).
    3. Confirm `requireUser('farmer')` throws `WRONG_ROLE` for a wholesaler.
- **Done when:** all three are confirmed manually on localhost.

### A1.3: `createListing` (**unblocks** B1.4)

- **P0** · 10 min · **Depends on:** A1.1
- **Read first:** `04-contracts.md` §3, `lib/schemas.ts`
- **Files:** `app/actions/listings.ts`
- **Do:**
    1. `run(async () => { const user = await requireUser('farmer'); const v = CreateListingSchema.parse(input); … })`.
    2. Insert with `farmer_id = user.id`, `crop = 'potato'`, `district = user.district ?? 'Okara'`, and `voice_transcript`. Then `revalidatePath('/', 'layout')` and return `{ id }`.
- **Done when:** calling it from a temporary server-action form (or via B's screen) creates a row; a wholesaler gets `WRONG_ROLE`.

### A1.4: `placeBid` and `withdrawBid` (**unblocks** D1.3, D1.4)

- **P0** · 15 min · **Depends on:** A1.1
- **Read first:** `02-business-rules.md` (rules table), `lib/rules.ts`
- **Files:** `app/actions/bids.ts`
- **Do:**
    - **placeBid:**
        1. `requireUser('wholesaler')`, then parse with `PlaceBidSchema`.
        2. Load the listing and run `validateBid(listing, input)`. If there's an error code, throw `Error(code)`, so the action returns `{ ok:false, error: code }`.
        3. Upsert into `bids` with `onConflict: 'listing_id,wholesaler_id'`, setting every field plus `status: 'pending'` and `created_at: new Date().toISOString()`.
        4. Return `{ id }`.
    - **withdrawBid:** owner check (`bid.wholesaler_id === user.id`), status must be `pending` (else `BID_NOT_PENDING`), then set `status = 'withdrawn'`.
- **Done when:** a bid below the minimum returns `BELOW_MINIMUM`; a second bid updates the same row; withdraw works only on your own pending bid.

### A1.5: `acceptBid` (**unblocks** B1.5)

- **P0** · 10 min · **Depends on:** A1.4
- **Files:** `app/actions/bids.ts`
- **Do:**
    1. `requireUser('farmer')`, then load the bid and its listing. If `listing.farmer_id !== user.id`, throw `NOT_YOUR_LISTING`.
    2. Call `db().rpc('accept_bid', { p_bid, p_token_pct: CONFIG.TOKEN_PERCENT, p_fee_pct: CONFIG.FEE_PERCENT, p_token_window_minutes: CONFIG.TOKEN_WINDOW_MINUTES })`.
    3. Map a Postgres error message containing `BID_NOT_PENDING` / `LISTING_NOT_OPEN` to that code.
    4. Return `{ saudaId: data }`.
- **Done when:** accepting creates a sauda in `token_due`, other bids are `rejected`, and the listing is `sold`. A second accept returns `BID_NOT_PENDING`.

### A1.6: `payToken` and `transition.ts` live (**unblocks** D1.5, B1.6)

- **P0** · 15 min · **Depends on:** A1.5
- **Read first:** `.kiro/steering/money-and-state.md`, `lib/transition.ts`, `lib/sauda-machine.ts`
- **Files:** `app/actions/saudas.ts`, `lib/transition.ts` (fixes only)
- **Do:**
    1. Read `lib/transition.ts` (the reference implementation) and make sure it works against the real database: `loadSauda`, the optimistic lock and the event insert.
    2. Implement **payToken:** `requireUser('wholesaler')`, then `applyTransition({ saudaId, action: 'payToken', actor: user, to: 'awaiting_collection', patch: { token_paid_at: now, collection_code: newCollectionCode() }, event: 'token_paid' })`.
    3. The expiry check comes later, in A3.1.
- **Done when:**
    - paying the token moves the sauda to `awaiting_collection`, with a 4-digit code and a `token_paid` event;
    - paying twice returns `BAD_TRANSITION:payToken:awaiting_collection`;
    - another wholesaler gets `NOT_YOUR_SAUDA`.

---

## Workstream B: farmer app

### B1.1: Farmer layout and building blocks

- **P0** · 20 min · **Depends on:** contracts-v1
- **Read first:** `.kiro/steering/farmer-ui.md`, `context/project/05-farmer-ui.md` (Layout, Images)
- **Files:**
    - `app/f/layout.tsx`
    - `components/farmer/BigButton.tsx`, `ScreenTitle.tsx`, `MoneyBig.tsx`, `GradeCard.tsx`, `StepDots.tsx`, `FarmerHeader.tsx`
- **Do:**
    1. The layout uses RTL, `lang="ur"`, Noto Nastaliq Urdu via `next/font/google`, line-height ≥ 1.9 and a stone-50 background.
    2. `FarmerHeader` shows `name_ur` from `requireUser('farmer')` (server), a home link and an exit link using `signOut`.
    3. Build the components as specified, with no business logic.
    4. `MoneyBig` takes `{ amount: number }`, renders `formatRsPK` with `dir="ltr"`, and is huge.
    5. `GradeCard` takes `{ grade: Grade; selected?: boolean; onSelect?: () => void }`, shows the photo from `public/img/grade-<x>.jpg` with an emoji fallback, and an Urdu one-line label.
- **Done when:** a temporary `/f` page renders the header and the components at 360 px with no horizontal scroll, and the Urdu font is visible.

### B1.2: F1 Home `/f`

- **P0** · 15 min · **Depends on:** B1.1 (works on fixture stubs before A1.1)
- **Files:** `app/f/page.tsx`, `components/farmer/HomeTiles.tsx`
- **Do:** as in 05-farmer-ui §F1:
    - `AudioPrompt clip="home_welcome" autoPlay`, plus `home_new_offers` when offers > 0;
    - three tiles with counts;
    - a list of open listings;
    - `<AutoRefresh />`.
- **Done when:**
    - as Rashid: 0 offers, and 1 sauda in progress (the seeded `collected` one);
    - as Naseem: 1 offer (the Lahore Fresh bid);
    - audio plays after the first tap on the choose-user page.

### B1.3: Sell wizard F2–F6

- **P0** · 35 min · **Depends on:** B1.1; uses the C stub `VoiceNumberInput` until C1.1 lands
- **Read first:** 05-farmer-ui §F2–F7
- **Files:** `app/f/sell/page.tsx` (server: loads `getReferencePrices()`), `components/farmer/SellWizard.tsx` (client), `components/farmer/ReadyTiles.tsx`, `components/farmer/RefPriceCard.tsx`
- **Do:**
    - One client component with `step` state (`'crop' | 'qty' | 'ready' | 'quality' | 'price' | 'review' | 'done'`) and a single state object `{ estimateKg, unit, ready, expectedGrade, minPricePerMann, transcripts[] }`.
    - Each step: `AudioPrompt autoPlay` with the step's clip, the input, the two bottom `BigButton`s and `StepDots`.
    - Validate before moving on: quantity > 0, price > 0. Never submit from these steps.
    - **F3:** default unit **mann**; store kg (`mannToKg`).
    - **F4:** derive the dates as specified.
    - **F6:** `RefPriceCard` shows the Lahore reference per mann, the date and the source word.
- **Done when:** you can step forwards and back through F2–F6 on a 360 px screen with values kept; there are no Urdu strings in the components except labels taken from `clips.json` / `phrases.ts`, or the one-line grade and tile labels in 05.

### B1.4: F7 read-back and publish

- **P0** · 20 min · **Depends on:** B1.3; A1.3 for a real write (`NOT_IMPLEMENTED` before that)
- **Files:** `components/farmer/SellWizard.tsx`, `components/farmer/ListingSummary.tsx`
- **Do:**
    1. Show the summary card (range from `estimateToRange`, in kg and mann; ready; grade; minimum per mann).
    2. `SpeakButton autoPlay text={readBackListing({ estimateKg, ready, minPricePerMann })}`, then `AudioPrompt clip="confirm_hint"`.
    3. ✓ calls `createListing({ qtyLowKg, qtyHighKg, expectedGrade, minPricePerKg: perMannToPerKg(minPricePerMann), readyFrom, readyTo, voiceTranscript: transcripts.join(' | ') || undefined })`. Show a spinner and disable the button meanwhile.
    4. On `ok`, show the `done` step with `listing_published` and a Home button.
    5. On error, play `error_generic` and keep the state.
    6. ✎ goes back to `qty`.
- **Done when:** after A1.3 merges, a listing created on the phone appears on `/market` (D) or in Supabase.

### B1.5: F8 Offers `/f/offers` and accept

- **P0** · 30 min · **Depends on:** B1.1; A1.5 for a real accept
- **Read first:** 05-farmer-ui §F8, `lib/net.ts`, `lib/voice/phrases.ts` (`explainOffer`)
- **Files:** `app/f/offers/page.tsx`, `components/farmer/OfferCard.tsx`, `components/farmer/NetCompare.tsx`, `components/farmer/ConfirmSheet.tsx`
- **Do:**
    - The server page loads `getOffersForFarmer(user.id)` and `getReferencePrices()`, groups the offers by listing, and plays `offers_intro` / `offers_none`. Add `<AutoRefresh />`.
    - **OfferCard:**
        - buyer `name_ur` + صاحب, and the verified badge;
        - the ladder per mann (`perKgToPerMann`), with "نہیں لیں گے" for null;
        - collection date and the loading icon;
        - `NetCompare` built from `compareNet(lahoreRef.price_per_kg, price for the expected grade, loading_paid_by, mid kg)`;
        - `SpeakButton text={explainOffer(...)}`.
    - **Accept:** `ConfirmSheet` plays `accept_confirm` with ✓/✗. ✓ calls `acceptBid(bid.id)`, then `router.push('/f/saudas/' + saudaId)`.
- **Done when:** as Naseem, the Lahore Fresh offer shows the ladder per mann (Rs 1,680 / Rs 1,480 / نہیں لیں گے) and the comparison; accepting (after A1.5) lands on the sauda page.

### B1.6: F9 Sauda card (`token_due`, `awaiting_collection`) and the list

- **P0** · 20 min · **Depends on:** B1.1
- **Files:** `app/f/saudas/page.tsx`, `app/f/saudas/[id]/page.tsx`, `components/farmer/SaudaTerms.tsx`, `components/farmer/SaudaPanel.tsx` (client; switches on status)
- **Do:**
    1. The page loads `getSauda(id)`, checks `farmer_id === user.id` (else `notFound()`) and adds `<AutoRefresh />`.
    2. `SaudaTerms` shows the ladder per mann, the range, `urduDate(collection_date)`, the loading, and the token amount with `DemoBadge`. Add `SpeakButton(explainSauda(...))`.
    3. Panel for `token_due`: `sauda_created` + `token_waiting`. Panel for `awaiting_collection`: `token_received`. The P1 code box comes in B3.1.
    4. Other statuses: a placeholder "coming in phase 2".
    5. The list page shows cards with `STATUS_LABEL[status].ur`.
- **Done when:** after accept and payToken (A1.6, D1.5), the farmer's screen moves from `token_due` to `awaiting_collection` within 3 seconds, without a manual refresh.

---

## Workstream C: voice and media

### C1.1: `VoiceNumberInput` number pad (**unblocks** B1.3; do this first)

- **P0** · 25 min · **Depends on:** contracts-v1
- **Read first:** `context/project/07-voice.md` (Components), `.kiro/steering/farmer-ui.md`
- **Files:** `components/voice/VoiceNumberInput.tsx`, `components/voice/NumberPad.tsx`
- **Do:**
    - Keep the props exactly.
    - **Layout:** a huge value with `dir="ltr"` and en-IN grouping; the unit word; the kg/mann toggle (only when `onUnitChange` is set); a 3×4 pad (1–9, ⌫, 0, clear) with keys of at least 64 px.
    - **Limits:** quantity ≤ 9,999,999; price ≤ 99,999; integers only.
    - Leave a mic button placeholder, disabled until C1.5.
    - Every key press calls `onChange`.
- **Done when:** on a 360 px screen you can enter 10000 and 1520 with the pad; ⌫ and clear work; there's no keyboard pop-up.

### C1.2: `AudioPrompt` final and the MP3s merged

- **P0** · 10 min · **Depends on:** C0.3
- **Files:** `components/voice/AudioPrompt.tsx`, `public/audio/ur/*.mp3`
- **Do:**
    - If `play()` rejects (autoplay blocked), add a pulsing ring to the replay button.
    - Stop the previous clip when a new one starts: use a module-level current-audio ref.
    - Keep the props unchanged.
- **Done when:** on the phone, F1's welcome plays after the choose-user tap; replay works; clips don't overlap.

### C1.3: TTS route and the real `SpeakButton`

- **P0** · 25 min · **Depends on:** C0.1
- **Read first:** 07-voice (Route handlers, Budget guardrails), 04-contracts §6
- **Files:** `lib/voice/uplift.ts` (server-only: `synthesize(text): Promise<ArrayBuffer>`; later `transcribe(blob)`), `app/api/voice/tts/route.ts`, `components/voice/SpeakButton.tsx`
- **Do:**
    1. Route: `GET` with `?text`. Validate 1–500 characters. Keep a module-level Map cache of up to 200 entries. Call `synthesize`. Return `audio/mpeg` with the cache-control header. `502` on failure.
    2. `SpeakButton`:
        - fetch the route, then play the blob;
        - cache the object URLs per text;
        - on error, or if `NEXT_PUBLIC_TTS_DISABLED=1`, fall back to `speechSynthesis` with `ur-PK`;
        - show a spinner while fetching.
- **Done when:** on the phone, F7's read-back speaks in the Uplift voice; with the key removed it falls back to the browser voice with no error shown to the farmer; a second tap doesn't make a new network call.

### C1.4: Urdu wording and `NUMBER_STYLE`

- **P0** · 10 min · **Depends on:** C0.1 (the digit test)
- **Files:** `lib/voice/phrases.ts`, `lib/voice/clips.json` (wording only), `lib/voice/urdu-number.ts` (spelling fixes only)
- **Do:**
    1. Apply the native-speaker fixes. Set `NUMBER_STYLE` from the digit test.
    2. Keep all IDs and signatures unchanged.
    3. If clip wording changed, regenerate **only** those clips (delete the file, then run `npm run gen:audio`).
- **Done when:** `npm test` passes (update the phrase test only if the wording changed); the changed clips are regenerated.

### C1.5: Mic input (45-minute hard cap)

- **P0 attempt** · 45 min · **Depends on:** C0.2, C1.1
- **Read first:** 07-voice (Providers, Components → `VoiceNumberInput`, Route handlers)
- **Files:** `components/voice/VoiceNumberInput.tsx`, `components/voice/useMic.ts`, `app/api/voice/stt/route.ts`, `app/api/voice/extract/route.ts`, `lib/voice/uplift.ts`, `lib/voice/extract.ts` (already present)
- **Do:**
    1. `useMic()` returns `{ state: 'idle' | 'listening' | 'thinking', start(), stop() }`. It plays `mic_listening`, then:
        - Uplift path: records with `MediaRecorder` (max 6 s) and POSTs to `/api/voice/stt`;
        - browser path: `webkitSpeechRecognition` with `ur-PK`.

      The path is chosen by `NEXT_PUBLIC_STT_PROVIDER`.
    2. POST the transcript to `/api/voice/extract`. Convert the unit (`detectUnit` result vs the displayed unit), then call `onChange(value, transcript)`. If there's no value, play `mic_retry`.
    3. Routes:
        - **stt:** Zod-validate, enforce the size limit, call `transcribe()` with the format confirmed in C0.2, and return `{ transcript }`;
        - **extract:** Zod-validate `{ transcript, field }`, then `extractField()`.
- **Done when:** on the phone, saying "دس ہزار کلو" on F3 fills 250 mann, or 10000 when kg is selected. If you hit the cap, ship the pad only, hide the mic button, and say so at the checkpoint.

---

## Workstream D: buyer and admin (Codex laptop)

### D1.1: Choose-user page `/`

- **P0** · 15 min · **Depends on:** contracts-v1
- **Read first:** `context/project/06-buyer-admin-ui.md` (`/`)
- **Files:** `app/page.tsx`, `components/buyer/UserCard.tsx`
- **Do:** a server page using `getProfiles()`, grouped by role, with large cards. Each card is a `<form action={setDemoUser.bind(null, p.id)}>`. Add the footer note.
- **Done when:** tapping each card lands on the right home (`/f`, `/market`, `/admin`; `/market` and `/admin` may 404 until built).

### D1.2: Buyer nav and the `/market` grid

- **P0** · 25 min · **Depends on:** D1.1
- **Files:** `components/buyer/BuyerNav.tsx`, `app/market/layout.tsx`, `app/bids/layout.tsx`, `app/saudas/layout.tsx`, `app/market/page.tsx`, `components/buyer/ListingCard.tsx`, `components/buyer/RefPriceStrip.tsx`
- **Do:** as in 06 (Buyer navigation, `/market`). Filters use a GET form and `searchParams`. Remember that in Next 15, `searchParams` is a Promise and must be awaited. Add `<AutoRefresh />`.
- **Done when:** as Imran, the two open seeded listings (Naseem's, Akram's) show with the correct kg and mann; the grade filter works.

### D1.3: `/market/[id]` and `BidForm` with live preview

- **P0** · 35 min · **Depends on:** D1.2; A1.4 for real writes
- **Read first:** 06 (`/market/[id]`), `lib/settle.ts` (`bidPreview`), `lib/rules.ts`
- **Files:** `app/market/[id]/page.tsx`, `components/buyer/BidForm.tsx`, `components/buyer/BidPreviewTable.tsx`, `components/buyer/ListingFacts.tsx`
- **Do:**
    - **Form:** A (required), B and C (number, or a "Don't accept" checkbox giving null), collection date (default `ready_from`), loading radio, note.
    - The live `bidPreview` table and the token / fee lines, with `DemoBadge` on the token.
    - Validate with `validateBid` on the client, showing `BID_ERROR_TEXT`.
    - Submit with `placeBid`, then a toast. Prefill from the user's existing bid.
- **Done when:**
    - for Naseem's listing (min 36, A expected), A = 35 shows "below his minimum" before submitting;
    - a valid bid saves (after A1.4), and re-opening the page shows "Update bid" with the values.

### D1.4: `/bids`

- **P0** · 10 min · **Depends on:** D1.2
- **Files:** `app/bids/page.tsx`, `components/buyer/BidsTable.tsx`
- **Do:** `getMyBids(user.id)` in a table, with a withdraw button (`withdrawBid`) on pending rows and a link to the sauda on accepted rows.
- **Done when:** as Lahore Fresh, the seeded bids show with their statuses.

### D1.5: `/saudas` list and `/saudas/[id]` (terms, timeline, token)

- **P0** · 30 min · **Depends on:** D1.2; A1.6 for real payToken
- **Read first:** 06 (`/saudas`, `/saudas/[id]`)
- **Files:** `app/saudas/page.tsx`, `app/saudas/[id]/page.tsx`, `components/buyer/SaudaTermsCard.tsx`, `components/buyer/Timeline.tsx`, `components/buyer/SaudaActions.tsx` (client; switches on status)
- **Do:**
    1. The list shows the next-action text per status.
    2. The detail page does the party check, shows the terms card and the timeline (`getSaudaEvents`), and adds `<AutoRefresh />`.
    3. Status `token_due` shows a countdown and **Pay token (DEMO)** → `payToken`.
    4. Other statuses show "phase 2" placeholders.
- **Done when:** as Imran after Rashid accepts, the sauda shows `token_due`; Pay token moves it to `awaiting_collection`, and the timeline shows `token_paid`.

---

## Checkpoint 1 smoke test (A runs it on production after merging; 10 min)

1. Laptop: `/` → Reviewer → `/admin` (may be a placeholder). Then switch to Imran → `/market` shows the seeded listings.
2. Phone: `/` → Rashid → F1 plays the welcome → Sell → potato → 250 mann (or 10000 kg) → next week → A → 1,520 per mann → the read-back speaks → ✓ → "published".
3. Laptop as Imran: the new listing appears within 3 seconds → bid A 45 / B 39 / C none → saved. As Lahore Fresh (incognito): A 44 / B 40 / C 32.
4. Phone: the Offers count is 2 → open → hear Imran's offer → Accept → ✓ → the sauda page shows `token_due`.
5. Laptop as Imran: `/saudas` → open → Pay token (DEMO) → the phone shows "token received" within 3 seconds.
6. Run `select reset_demo();` (announce it first).

If a step fails: the owner gets 15 minutes into Phase 2 to fix it. Otherwise, cut by the order below.

## Cut order if Phase 1 runs late

1. C1.5 mic (ship the pad).
2. B1.2's open-listings list.
3. D1.4 `/bids` page.
4. The F8 net comparison bars: keep the numbers, drop the bars.

**Never cut:** A1.1–A1.6, B1.3–B1.5, C1.1, C1.3, D1.1–D1.3, D1.5.
