# 04: Contracts (frozen as `contracts-v1` at the end of Phase 0)

This file is what lets four people and four agents build in parallel without breaking each other. Everything here is fixed once Phase 0 merges, and every name below exists in the repo after step A0.4.

**Code against these signatures, not against the stub behaviour.** Stubs return fixtures or `NOT_IMPLEMENTED` until the owner fills them in.

**Change protocol:** only the owner edits a contract. If you need a change:

1. Post a `CONTRACT CHANGE REQUEST` (format in AGENTS.md).
2. The owner (usually A) makes an additive change on `main`, bumps the tag (`contracts-v2`) and announces it.
3. Everyone pulls.

Changes are **additive only**: new optional fields, new functions. Never rename or remove anything.

---

## 1. Shared library (owner A; pure; tested)

| File | Exports |
|---|---|
| `lib/types.ts` | `Role`, `Grade`, `GRADES`, `ListingStatus`, `BidStatus`, `SaudaStatus`, `CancelReason`, `LoadingPaidBy`, `TokenTo`, `Profile`, `ProfileLite`, `ReferencePrice`, `Listing`, `Bid`, `SaudaTerms`, `Sauda`, `SaudaEventType`, `SaudaEvent`, `Evidence`, `ListingView`, `BidView`, `SaudaView`, `AdminStats`, `ActionResult<T>` |
| `lib/schemas.ts` | Zod: `CreateListingSchema`, `PlaceBidSchema`, `RecordCollectionSchema`, `FarmerDisputeSchema`, `ResolveDisputeSchema`, `CancelSaudaSchema`, `IdSchema`, and the inferred `*Input` types |
| `lib/config.ts` | `CONFIG` (FEE_PERCENT 1, TOKEN_PERCENT 10, TOKEN_WINDOW_MINUTES 30, SHORTFALL_RATIO 0.8, QTY_RANGE_PERCENT 10, KG_PER_MANN 40, MANDI_COMMISSION_PERCENT 3, TRANSPORT_PER_KG_TO_MANDI 2.5, LABOUR_PER_KG 0.75, DEMO_MODE), `DEMO_IDS` |
| `lib/format.ts` | `formatRs`, `formatRsPK`, `formatKg`, `kgToMann`, `mannToKg`, `perKgToPerMann`, `perMannToPerKg`, `estimateToRange`, `formatDate` |
| `lib/settle.ts` | `settle(terms, weighedKg, grade): SettleResult`, `isShortfall`, `tokenAmount`, `tokenBasePrice`, `bidPreview(listing, prices): BidPreview` |
| `lib/net.ts` | `mandiNetPerKg`, `offerNetPerKg`, `compareNet(refPerKg, offerPerKg, loadingPaidBy, qtyKg): NetComparison` |
| `lib/sauda-machine.ts` | `SaudaAction`, `ALLOWED_FROM`, `ALLOWED_ROLES`, `CANCEL_RULES`, `TransitionError`, `assertTransition`, `assertCancel`, `tokenDestination`, `statusAfterGrade`, `STATUS_LABEL` (en/ur) |
| `lib/rules.ts` | `validateBid(listing, bid): BidRuleError \| null`, `BID_ERROR_TEXT`, `newCollectionCode()` |
| `lib/fixtures.ts` | Typed demo data mirroring the seed: `profiles`, `referencePrices`, `listings`, `bids`, `saudas`, `adminStats`, `lite(id)` |

## 2. Server-only data access (owner A)

`lib/db.ts`: `db()`, `toNum`, `toNumOrNull`.

`lib/session.ts`: `UID_COOKIE`, `ROLE_COOKIE`, `HOME_BY_ROLE`, `getCurrentUser()`, `requireUser(role?)`.

`lib/transition.ts`: `loadSauda(id)`, `applyTransition({...})`, `applyCancel({...})`.

### `lib/queries.ts`: reads (Phase 0 stubs return fixtures; A1.1 makes them real)

| Function | Returns | Semantics | Used by |
|---|---|---|---|
| `getProfiles()` | `Profile[]` | All demo users, farmers first | D `/` |
| `getProfile(id)` | `Profile \| null` | n/a | session |
| `getWholesalers()` | `Profile[]` | n/a | D `/admin/users` |
| `getReferencePrices()` | `ReferencePrice[]` | Lahore first | B F6/F8, D `/market` |
| `getOpenListings(filters?)` | `ListingView[]` | status `open`, newest first; filters `district`, `grade`, `readyBy` (ready_from ≤ readyBy) | D `/market` |
| `getListing(id)` | `ListingView \| null` | Any status | D `/market/[id]` |
| `getMyListings(farmerId)` | `ListingView[]` | Any status, newest first, with `bid_count` (pending) | B F1 |
| `getOffersForFarmer(farmerId)` | `BidView[]` | Pending bids on the farmer's **open** listings, highest `price_a` first | B F1, F8 |
| `getBidsForListing(listingId)` | `BidView[]` | All statuses | D `/market/[id]` |
| `getMyBids(wholesalerId)` | `BidView[]` | All statuses, newest first | D `/bids`, `/market/[id]` |
| `getSaudasForUser(user)` | `SaudaView[]` | Farmer: his; wholesaler: his; admin: all. Newest first. | B F1 `/f/saudas`, D `/saudas` |
| `getSauda(id)` | `SaudaView \| null` | n/a | B F9–F11, D `/saudas/[id]`, `/admin/disputes/[id]` |
| `getSaudaEvents(saudaId)` | `SaudaEvent[]` | Oldest first | D timelines |
| `getEvidence(saudaId)` | `Evidence[]` | Oldest first | D dispute view, B F10 |
| `getDisputes()` | `SaudaView[]` | status `disputed`, oldest first | D `/admin` |
| `getAdminStats()` | `AdminStats` | Sums over **settled** saudas | D `/admin` |

**Authorisation on reads:** pages call `requireUser(role)` and pass `user.id`. For `/f/saudas/[id]` and `/saudas/[id]`, the page must check that the user is a party (`sauda.farmer_id` / `wholesaler_id`), otherwise `notFound()`.

## 3. Server actions: the only writes (owner A; Phase 0 stubs return `{ ok:false, error:'NOT_IMPLEMENTED' }`)

All actions:

- run `'use server'`;
- call `requireUser`;
- parse with Zod;
- go through `run()`;
- call `revalidatePath('/', 'layout')` after a write;
- return `ActionResult`.

Error strings are listed in §9.

| Action (file) | Who | Does | Errors | Step |
|---|---|---|---|---|
| `setDemoUser(userId): Promise<void>` (session.ts) | anyone | Sets the cookies, redirects to `HOME_BY_ROLE` | `UNKNOWN_USER` | A0.4 (real) |
| `signOut(): Promise<void>` (session.ts) | anyone | Clears the cookies, redirects to `/` | n/a | A0.4 (real) |
| `createListing(input: CreateListingInput): ActionResult<{id}>` (listings.ts) | farmer | Inserts a listing: crop `potato`, district = the user's district, status `open` | Zod | A1.3 |
| `cancelListing(listingId): ActionResult` (listings.ts) | farmer (owner) | open → cancelled; pending bids → rejected | `LISTING_NOT_OPEN` | A3.6 (P1) |
| `placeBid(input: PlaceBidInput): ActionResult<{id}>` (bids.ts) | wholesaler | `validateBid`; **upsert** on (listing_id, wholesaler_id) with status `pending` | `BidRuleError` codes | A1.4 |
| `withdrawBid(bidId): ActionResult` (bids.ts) | wholesaler (owner) | pending → withdrawn | `BID_NOT_PENDING` | A1.4 |
| `acceptBid(bidId): ActionResult<{saudaId}>` (bids.ts) | farmer (listing owner) | `rpc('accept_bid', …)` | `BID_NOT_PENDING`, `LISTING_NOT_OPEN`, `NOT_YOUR_LISTING` | A1.5 |
| `rejectBid(bidId): ActionResult` (bids.ts) | farmer (listing owner) | pending → rejected | `BID_NOT_PENDING` | A3.6 (P1) |
| `payToken(saudaId): ActionResult` (saudas.ts) | wholesaler (party) | If past `token_due_by` (P1): cancel `token_expired` and return `TOKEN_EXPIRED`. Else transition → awaiting_collection with `token_paid_at`, `collection_code = newCollectionCode()`; event `token_paid`. | transition errors, `TOKEN_EXPIRED` | A1.6 |
| `recordCollection(input): ActionResult` (saudas.ts) | wholesaler (party) | `settle()`; store `weighed_kg`, `delivered_grade`, `buyer_note`, `final_amount` / `platform_fee` (null if grade not accepted); → collected; event `collected` with `{weighed_kg, grade, outcome}` | transition errors | A2.2 |
| `farmerConfirm(saudaId): ActionResult<{status}>` (saudas.ts) | farmer (party) | Priced grade → agreed (`agreed_at`), event `confirmed`. Unpriced → `applyCancel('grade_not_accepted')`. | transition errors | A2.3 |
| `farmerDispute(input): ActionResult` (saudas.ts) | farmer (party) | → disputed with `farmer_claimed_grade`, `dispute_reason`; event `disputed` | transition errors | A2.3 |
| `confirmBalanceReceived(saudaId): ActionResult` (saudas.ts) | farmer (party) | agreed → settled (`settled_at`); event `balance_received` | transition errors | A2.4 |
| `cancelSauda(input): ActionResult` (saudas.ts) | per `CANCEL_RULES` | `applyCancel`. For `shortfall`, check `isShortfall(terms, weighed_kg)`. | `NOT_A_SHORTFALL`, transition errors | A2.6 (P0 code path) / A3.2 (P1 UI) |
| `uploadEvidence(form: FormData): ActionResult<{id,url}>` (evidence.ts) | farmer or wholesaler (party) | Form fields `saudaId`, `kind`, `file` (image ≤ 5 MB), `lat?`, `lng?`. Upload to bucket `evidence/<saudaId>/<kind>-<timestamp>.jpg`; insert an `evidence` row. | `FILE_TOO_LARGE`, `NOT_AN_IMAGE`, `NOT_YOUR_SAUDA` | A3.3 (P1) |
| `resolveDispute(input): ActionResult<{status}>` (admin.ts) | admin | Priced grade → agreed, with `resolved_grade`, `resolution_note`, a new `final_amount` / `platform_fee` from `settle()`, `agreed_at`; event `resolved`. Unpriced → `applyCancel('grade_not_accepted')`, then store `resolved_grade` / `resolution_note`. | transition errors | A2.5 |
| `setVerified(profileId, verified): ActionResult` (admin.ts) | admin | Updates `profiles.verified` | n/a | A3.4 (P1) |
| `resetDemo(): ActionResult` (admin.ts) | admin | `rpc('reset_demo')` | n/a | A3.5 (P1) |

## 4. Routes

| Route | Owner | Role | Screen | Reads | Writes | Uses components |
|---|---|---|---|---|---|---|
| `/` | D | public | Choose demo user | `getProfiles` | `setDemoUser` | n/a |
| `/f` | B | farmer | **F1** home | `getMyListings`, `getOffersForFarmer`, `getSaudasForUser` | n/a | `AudioPrompt`, `AutoRefresh` |
| `/f/sell` | B | farmer | **F2–F7** wizard (one route, client-side steps) | `getReferencePrices` | `createListing` | `AudioPrompt`, `VoiceNumberInput`, `SpeakButton` |
| `/f/offers` | B | farmer | **F8** offers | `getOffersForFarmer`, `getReferencePrices` | `acceptBid`, `rejectBid` (P1) | `SpeakButton`, `AudioPrompt`, `AutoRefresh` |
| `/f/saudas` | B | farmer | Sauda list / history | `getSaudasForUser` | n/a | `AudioPrompt` |
| `/f/saudas/[id]` | B | farmer | **F9** card, **F10** collection, **F11** paid | `getSauda`, `getEvidence` | `farmerConfirm`, `farmerDispute`, `confirmBalanceReceived`, `uploadEvidence` (P1) | `SpeakButton`, `AudioPrompt`, `CameraCapture`, `AutoRefresh`, `DemoBadge` |
| `/market` | D | wholesaler | Listing grid + filters | `getOpenListings`, `getReferencePrices` | n/a | `AutoRefresh` |
| `/market/[id]` | D | wholesaler | Listing detail + bid form | `getListing`, `getReferencePrices`, `getMyBids` | `placeBid` | `BidForm` (D) using `bidPreview` |
| `/bids` | D | wholesaler | My bids | `getMyBids` | `withdrawBid` | n/a |
| `/saudas` | D | wholesaler | My saudas | `getSaudasForUser` | n/a | `AutoRefresh` |
| `/saudas/[id]` | D | wholesaler | Sauda card, timeline, token, collection form, cancel | `getSauda`, `getSaudaEvents`, `getEvidence` | `payToken`, `recordCollection`, `cancelSauda`, `uploadEvidence` (P1) | `CameraCapture`, `DemoBadge`, `AutoRefresh` |
| `/admin` | D | admin | Tiles + disputes queue + reset | `getAdminStats`, `getDisputes` | `resetDemo` (P1) | `AutoRefresh` |
| `/admin/disputes/[id]` | D | admin | Evidence side by side + ruling | `getSauda`, `getSaudaEvents`, `getEvidence` | `resolveDispute`, `cancelSauda` (`dispute_unresolved`, P1) | n/a |
| `/admin/users` | D | admin | Verify wholesalers (P1) | `getWholesalers` | `setVerified` | n/a |
| `/voice-test.html` | C | public | Phone test page | n/a | n/a | n/a |

Layouts:

- `app/layout.tsx` (A): html, body, Toaster.
- `app/f/layout.tsx` (B): RTL, Urdu font, farmer header with a sign-out link.
- `app/market/layout.tsx`, `app/saudas/layout.tsx`, `app/bids/layout.tsx` (D): each renders `<BuyerNav />` from `components/buyer/BuyerNav.tsx`.
- `app/admin/layout.tsx` (D).

## 5. Components shared across workstreams

| Component | Owner | Props (frozen) | Phase 0 stub does |
|---|---|---|---|
| `AudioPrompt` (`components/voice`) | C | `{ clip: ClipId; autoPlay?: boolean; className?: string }` | Plays `/audio/ur/<clip>.mp3`; replay button |
| `SpeakButton` (`components/voice`) | C | `{ text: string; autoPlay?: boolean; label?: string; className?: string }` | Browser `speechSynthesis` |
| `VoiceNumberInput` (`components/voice`) | C | `{ field: 'quantity' \| 'price'; unit: 'kg' \| 'mann'; onUnitChange?: (u) => void; value: number \| null; onChange: (value: number \| null, transcript?: string) => void }` (value in the **displayed unit**) | Big numeric input |
| `CameraCapture` (`components/media`) | C | `{ onCapture: (file: File, coords: { lat: number; lng: number } \| null) => void; hint?: string }` | File input with `capture="environment"` |
| `AutoRefresh` (`components/shared`) | A | `{ seconds?: number }` | Real |
| `DemoBadge` (`components/shared`) | A | `{ text?: string }` | Real |

## 6. Voice HTTP API (owner C)

| Endpoint | Request | Response | Notes |
|---|---|---|---|
| `GET /api/voice/tts?text=<urlencoded>` | `text`: 1–500 chars of Urdu | `200 audio/mpeg`, `Cache-Control: public, max-age=86400` | Calls Uplift TTS with `UPLIFT_VOICE_ID`, `MP3_22050_128`. In-memory cache by text. `400` on bad text; `502` on upstream failure, which makes the client fall back to browser TTS. |
| `POST /api/voice/stt` | `multipart/form-data`, field `audio` (Blob from `MediaRecorder`) | `200 { transcript: string }` | Uplift Scribe, `language: 'ur'`, `domain: 'farming'` (verify field names, see 07-voice). `501` if `STT_PROVIDER=browser`. `502` on failure. |
| `POST /api/voice/extract` | JSON `{ transcript: string; field: 'quantity' \| 'price' }` | `200 { value: number \| null; unit: 'kg' \| 'mann' \| null; source: 'parser' \| 'llm' \| 'none' }` | `lib/voice/extract.ts`: parser first, Claude fallback |

## 7. Voice content (owner C)

- **Clip IDs** (`lib/voice/clips.json`; files at `public/audio/ur/<id>.mp3`): `home_welcome`, `home_new_offers`, `crop_ask`, `qty_ask`, `ready_ask`, `quality_ask`, `price_ask`, `price_reference`, `confirm_hint`, `listing_published`, `offers_intro`, `offers_none`, `accept_confirm`, `sauda_created`, `token_waiting`, `token_received`, `collection_code`, `collection_intro`, `collection_choice`, `dispute_grade_ask`, `dispute_sent`, `dispute_resolved`, `balance_ask`, `settled`, `mic_listening`, `mic_retry`, `error_generic`, `offline`.
- **Phrases** (`lib/voice/phrases.ts`; each returns an Urdu string):
    - `readBackListing({ estimateKg, ready: 'this_week' | 'next_week' | 'two_weeks', minPricePerMann })`
    - `explainOffer({ buyerNameUr, verified, perMann: {A,B,C}, loadingPaidBy, offerTotal, mandiTotal })`
    - `explainSauda({ buyerNameUr, collectionDate, tokenAmount })`
    - `explainCollection({ kind: 'payable', buyerNameUr, weighedKg, grade, finalAmount, tokenAmount, balance } | { kind: 'grade_not_accepted', buyerNameUr, weighedKg, grade })`
    - `askBalance(balance)`
    - Also exported: `GRADE_UR`, `READY_UR`, `NUMBER_STYLE`.
- **Numbers:** `lib/voice/urdu-number.ts` (`toUrduWords`, `urduDate`, `URDU_0_99`) and `lib/voice/parse-number.ts` (`parseUrduNumber`, `detectUnit`).

## 8. Environment variables (`context/setup/env.example`)

| Var | Used by | Secret |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/db.ts` | no |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/db.ts` | **yes** |
| `UPLIFT_API_KEY` | `app/api/voice/*`, `scripts/generate-audio.mjs` | **yes** |
| `UPLIFT_VOICE_ID` | TTS (default `v_8eelc901`) | no |
| `STT_PROVIDER` | `uplift` \| `browser` (set after the phone test) | no |
| `ANTHROPIC_API_KEY` | `lib/voice/extract.ts` (optional fallback) | **yes** |
| `LLM_MODEL` | default `claude-haiku-5-5` | no |
| `PLATFORM_FEE_PERCENT`, `TOKEN_PERCENT`, `TOKEN_WINDOW_MINUTES` | `lib/config.ts` | no |
| `NEXT_PUBLIC_STT_PROVIDER` | Client: which mic path `VoiceNumberInput` uses (mirror of `STT_PROVIDER`) | no |
| `NEXT_PUBLIC_TTS_DISABLED` | `1` = `SpeakButton` skips Uplift and uses the browser voice (saves free minutes in dev) | no |

## 9. Error codes and what the UI shows

| Code | Buyer/admin UI (English) | Farmer UI |
|---|---|---|
| `NOT_IMPLEMENTED` | "Not built yet" (dev only) | `error_generic` clip |
| `NOT_SIGNED_IN`, `WRONG_ROLE` | Redirect to `/` | Redirect to `/` |
| `LISTING_NOT_OPEN`, `EXPECTED_GRADE_NOT_PRICED`, `BELOW_MINIMUM`, `LADDER_NOT_DESCENDING`, `COLLECTION_BEFORE_READY` | `BID_ERROR_TEXT[code]` next to the form | n/a |
| `BID_NOT_PENDING` | "This bid is no longer open." | `error_generic` + refresh |
| `TOKEN_EXPIRED` | "Token window passed; the listing has reopened." | n/a |
| `BAD_TRANSITION:*`, `CONCURRENT_UPDATE` | "Someone already updated this deal. Refreshing…" then `router.refresh()` | `error_generic` + refresh |
| `NOT_YOUR_SAUDA`, `NOT_YOUR_LISTING`, `ROLE_NOT_ALLOWED:*` | "Not allowed." | `error_generic` |
| `NOT_A_SHORTFALL` | "Weight is not below 80% of the low estimate." | n/a |
| `FILE_TOO_LARGE`, `NOT_AN_IMAGE` | Message next to the camera | `error_generic` |
| Zod message | Show the message | `error_generic` |
