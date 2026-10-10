# 05: Farmer app (Workstream B)

The farmer UI rules are in `.kiro/steering/farmer-ui.md`; read them first.

- All farmer routes live under `/f`, are right to left, and use Noto Nastaliq Urdu.
- Fixed prompts are clip IDs (`AudioPrompt`). Dynamic sentences come from `lib/voice/phrases.ts` (`SpeakButton`).
- Number entry always uses `VoiceNumberInput` from C.

## Layout: `app/f/layout.tsx`

- `<div dir="rtl" lang="ur" className={nastaliq.className + ' min-h-dvh bg-stone-50 leading-[1.9]'}>`.
- The font comes from `next/font/google`, e.g. `Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400','700'] })`. If that subset name fails, use `subsets: ['latin']` plus `preload: false`; it still renders Urdu.
- Header:
    - the farmer's name in Urdu (`name_ur`);
    - a home icon linking to `/f`;
    - a small "Exit" link that calls `signOut`.
- Bottom area: reserved for the two primary buttons (sticky on wizard screens).
- Shared farmer components go in `components/farmer/`:
    - `BigButton` (variants `go` green / `stop` red / `plain`, at least 56 px, full width);
    - `ScreenTitle`;
    - `MoneyBig` (huge `formatRsPK`, `dir="ltr"`);
    - `GradeCard` (photo + letter);
    - `StepDots`.

## Images (`public/img/`, owned by B)

Images: `potato.jpg`, `grade-a.jpg`, `grade-b.jpg`, `grade-c.jpg`, `week-this.svg`, `week-next.svg`, `week-two.svg`, `mann.svg` (a sack), `kg.svg` (a scale).

- Use your own photos or freely licensed ones, and note the source in `public/img/CREDITS.md`.
- If there's no time, use a large emoji and a letter on a coloured tile: 🥔 for the crop; A green, B amber, C red.

## Screens

### F1: Home `/f` (server component + `AutoRefresh`)

- On open: `AudioPrompt clip="home_welcome" autoPlay`. If there are pending offers, also show a pulsing badge and `AudioPrompt clip="home_new_offers"`.
- Three huge tiles, stacked:
    1. **فصل بیچیں** (Sell crop) → `/f/sell`. Primary, green, 🥔.
    2. **بولیاں** (Offers) with a count bubble, from `getOffersForFarmer(user.id).length` → `/f/offers`.
    3. **میرے سودے** (My deals) with a count of non-settled saudas → `/f/saudas`.
- Below the tiles, a list of the farmer's open listings: quantity range in kg and mann, and the number of bids.

### F2–F7: Sell wizard `/f/sell`

One client component (`components/farmer/SellWizard.tsx`) with `step` state, rendered by a server `page.tsx` that passes `referencePrices`.

- Each step: an `AudioPrompt autoPlay`, one question, the two bottom buttons (✓ next, ← back), and `StepDots`.
- Keep all answers in one state object.
- P1: mirror the state to `localStorage` key `ps_sell_draft` and restore it on load.

| Step | Prompt clip | Input | Stored as |
|---|---|---|---|
| F2 Crop | `crop_ask` | One big potato tile (selected by default) and greyed-out tiles for other crops ("coming soon"). Tap → next. | `crop = 'potato'` |
| F3 Quantity | `qty_ask` | `VoiceNumberInput field="quantity"` with a kg/mann toggle (default **mann**) | `estimateKg` (convert with `mannToKg`) |
| F4 Ready when | `ready_ask` | 3 tiles: اس ہفتے / اگلے ہفتے / دو ہفتے میں | `ready`; dates: this_week = today…+6, next_week = +7…+13, two_weeks = +14…+20 |
| F5 Quality | `quality_ask` | 3 `GradeCard`s A/B/C with photos and one-line Urdu labels: A = بڑے، سخت، بہت کم داغ; B = درمیانے یا کچھ داغ; C = چھوٹے یا زیادہ داغ | `expectedGrade` |
| F6 Minimum price | `price_ask`, then `price_reference` | `VoiceNumberInput field="price" unit="mann"`. Above it, a card: **AMIS Lahore: Rs 2,000/من**, `source_date`, and the word ILLUSTRATIVE if `source === 'ILLUSTRATIVE'` (`perKgToPerMann(ref.price_per_kg)`). | `minPricePerMann` → `perMannToPerKg` |
| F7 Read-back | `SpeakButton autoPlay text={readBackListing({estimateKg, ready, minPricePerMann})}`, then `AudioPrompt clip="confirm_hint"` | A summary card with icons: quantity range (`estimateToRange`) in kg and mann, ready label, grade card, minimum price per mann. Buttons: ✓ **ٹھیک ہے** (publish) / ✎ **بدلیں** (back to F3). | n/a |

**Publish:**

1. Call `createListing({ qtyLowKg, qtyHighKg, expectedGrade, minPricePerKg, readyFrom, readyTo, voiceTranscript })`.
2. While waiting, show a spinner and disable the buttons.
3. On `ok`, show a success screen with `AudioPrompt clip="listing_published" autoPlay` and a big "Home" button, then clear the draft.
4. On error, play `error_generic` and stay on F7 with the data intact.

`voiceTranscript` holds any transcripts collected by `VoiceNumberInput`'s `onChange(value, transcript)`, joined with " | ".

### F8: Offers `/f/offers` (server page + client cards + `AutoRefresh`)

- On open: `offers_intro`, or `offers_none` if the list is empty.
- One `OfferCard` (`components/farmer/OfferCard.tsx`) per pending bid, grouped under each listing.
- **Card contents:**
    - buyer name (`buyer.name_ur` + صاحب) and a ✓ verified badge;
    - a ladder table per mann: A, B, C (or "نہیں لیں گے" for null);
    - collection date;
    - a loading icon (buyer pays / you pay).
- **"What reaches your hand" box:** compute it with `compareNet(ref.price_per_kg, bid[price for listing.expected_grade], bid.loading_paid_by, midKg)`, using the Lahore reference.
    - Show two bars: **منڈی لے جائیں تو** (mandi route) vs **اس بولی سے** (this offer), with totals in `formatRsPK`.
    - Label the comparison "تخمینہ" (estimate).
- `SpeakButton` with `explainOffer({ buyerNameUr, verified, perMann, loadingPaidBy, offerTotal, mandiTotal })`.
- **Accept:**
    1. Tapping **قبول کریں** opens a confirm sheet that plays `accept_confirm`, with the buttons ✓ ہاں / ✗ نہیں.
    2. ✓ calls `acceptBid(bid.id)`.
    3. On `ok`, go to `/f/saudas/<saudaId>`.
- P1: **یہ نہیں** (not this one) → `rejectBid`.

### F9–F11: Sauda `/f/saudas/[id]` (server page that picks a client panel by status; `AutoRefresh`)

The page loads `getSauda(id)` and checks that `sauda.farmer_id === user.id`, otherwise `notFound()`. It then renders by `status`:

| Status | Screen | Content |
|---|---|---|
| `token_due` | **F9** | `sauda_created` + `token_waiting`. The terms card: ladder per mann, quantity range, collection date (`urduDate`), loading, token amount. `SpeakButton(explainSauda(...))`. |
| `awaiting_collection` | **F9** | `token_received` and a ✓ "token received" chip with `DemoBadge`. **P1:** the `collection_code` shown huge in its own box, plus `AudioPrompt clip="collection_code"`. |
| `collected` | **F10** | See below |
| `disputed` | **F10b** | `dispute_sent`: "a neutral reviewer will decide; the crop stays with you". Shows the claimed grade and the buyer's recorded grade side by side. |
| `agreed` | **F11** | If it was reached through a dispute, play `dispute_resolved` first. Then `SpeakButton(askBalance(balance))` with `AudioPrompt clip="balance_ask"` as fallback. Big amount: the balance (`final_amount − token_amount`) with the `DemoBadge` text "payment happens in cash or by bank, outside the app". Buttons: ✓ **مل گئے** → `confirmBalanceReceived`; ✗ **ابھی نہیں** (just closes). |
| `settled` | **F11b** | `settled` clip. Green summary: kg, grade, total received, date. |
| `cancelled` | n/a | Reason in Urdu (map `cancel_reason`) and where the token went (`token_to`). |

**F10 (collected):**

1. Play `collection_intro`, then `SpeakButton autoPlay` with `explainCollection(...)` built from `settle(terms, weighed_kg, delivered_grade)`.
2. Show the weight (kg and mann), the grade card, the total, the token already received and the balance, all huge.
3. Play `collection_choice`.
4. Buttons:
    - ✓ **ٹھیک ہے** → `farmerConfirm(id)`. The result is `agreed` → F11, or `cancelled` when the grade is unpriced.
    - ✗ **گریڈ غلط ہے** → a dispute sheet:
        - plays `dispute_grade_ask`;
        - three `GradeCard`s to pick the grade he believes;
        - optional reason chips (no typing): "آلو بڑے ہیں", "داغ کم ہیں", "وزن غلط ہے";
        - **P1:** `CameraCapture` for his own photo, uploaded with `uploadEvidence(kind='dispute')`.
    - Submitting calls `farmerDispute({ saudaId, claimedGrade, reason })`.

### `/f/saudas`: list

Cards per sauda: buyer, status label (`STATUS_LABEL[status].ur`), amount if known. Tap opens the sauda. P1: settled history at the bottom, with the total earned, as the record that later helps him borrow.

## Done-when checks for the farmer app

- Works at 360 × 740 in Chrome DevTools (Moto G4 preset) with no horizontal scroll.
- Every screen plays audio on open after the first user tap, and has a replay button.
- Every write button shows a spinner and blocks a double tap.
- Every money amount comes from `settle()` / `compareNet()` / sauda columns, never from inline maths.
