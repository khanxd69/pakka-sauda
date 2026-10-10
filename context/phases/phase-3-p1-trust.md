# Phase 3: P1, the trust features (3:30 → 4:15, then FREEZE)

**Goal:** make the demo convincing:

- live-camera evidence with a one-time code;
- token expiry and the cancel paths;
- verify buyers;
- a one-click demo reset for rehearsals.

The first 15 minutes go to Checkpoint 2 fixes.

**FREEZE at 4:15.** A merges whatever is done. Unfinished P1 stays on its branch. Do the steps in the order listed: the most valuable come first.

---

## Workstream A

### A3.0: Checkpoint 2 fixes (15-minute cap)

- **Files:** A's files only. Fix anything from the Checkpoint 2 glitch list that belongs to A.

### A3.5: `resetDemo` (do this first: rehearsals depend on it)

- **P1** · 5 min
- **Files:** `app/actions/admin.ts`
- **Do:** `requireUser('admin')`, then `db().rpc('reset_demo')`, then `revalidatePath('/', 'layout')`.
- **Done when:** the button (D3.3) restores the seed state.

### A3.3: `uploadEvidence` (**unblocks** B3.2, D3.1)

- **P1** · 20 min
- **Read first:** 04-contracts §3 (`uploadEvidence`), 02 (Evidence a reviewer can trust)
- **Files:** `app/actions/evidence.ts`
- **Do:**
    1. `requireUser()`. Read `form.get('saudaId'|'kind'|'file'|'lat'|'lng')`.
    2. Validate: `kind` ∈ {collection, dispute}; the file is an image; ≤ 5 MB.
    3. Load the sauda and check the user is a party (wholesaler for `collection`, farmer for `dispute`), else `NOT_YOUR_SAUDA`.
    4. `db().storage.from('evidence').upload(`${saudaId}/${kind}-${Date.now()}.jpg`, file, { contentType: file.type })`, then `getPublicUrl`.
    5. Insert an `evidence` row. `captured_at` is the database default (server time), never the client's.
    6. Return `{ id, url }`.
- **Done when:** a photo uploaded from the phone appears in Storage and in `getEvidence(saudaId)` with a server timestamp.

### A3.1: Token expiry

- **P1** · 10 min
- **Files:** `app/actions/saudas.ts`
- **Do:** in `payToken`, before the transition: if `new Date(s.token_due_by) < new Date()`, call `applyCancel({ reason: 'token_expired', actor: null })` (this reopens the listing), then throw `TOKEN_EXPIRED`.
- **Done when:** with `TOKEN_WINDOW_MINUTES=1` locally, waiting a minute and then paying gives `TOKEN_EXPIRED`, a `cancelled` sauda and an `open` listing.

### A3.4: `setVerified`

- **P1** · 5 min
- **Files:** `app/actions/admin.ts`
- **Do:** `requireUser('admin')`, then update `profiles.verified` for a wholesaler.
- **Done when:** Pak Agro Buyers can be toggled to verified and back.

### A3.6: `cancelListing` and `rejectBid`

- **P1** · 10 min
- **Files:** `app/actions/listings.ts`, `app/actions/bids.ts`
- **Do:** as in 04-contracts §3, with owner checks.
- **Done when:** a farmer can decline one offer, and withdraw an open listing (its pending bids become rejected).

### A3.2: Cancel paths, end to end with D

- **P1** · 10 min
- **Do:** with D3.2, check `buyer_walked_away`, `shortfall` and `dispute_unresolved` from the UI. Each should give the right status, `token_to` and event.

---

## Workstream B

### B3.1: Collection code on F9

- **P1** · 10 min
- **Files:** `components/farmer/SaudaPanel.tsx`, `components/farmer/CodeBox.tsx`
- **Do:** for `awaiting_collection`, show `collection_code` huge (4 digits, `dir="ltr"`, high contrast) with `AudioPrompt clip="collection_code"`. Add the text "خریدار کو یہ نمبر دکھائیں" (show the buyer this number).
- **Done when:** after the token is paid, the code is readable from 1 m away.

### B3.2: Farmer photos when disputing

- **P1** · 15 min · **Depends on:** A3.3, C3.1
- **Files:** `components/farmer/DisputeSheet.tsx`
- **Do:**
    1. Add `CameraCapture` with hint "اپنے آلو کی تصویر لیں" (take a photo of your potatoes).
    2. On capture, call `uploadEvidence(FormData{ saudaId, kind: 'dispute', file, lat, lng })` before `farmerDispute`.
    3. A failed upload must not block the dispute: submit without the photo and play `error_generic`.
- **Done when:** the farmer's photo shows on the reviewer's evidence screen.

### B3.3: Offline-safe listing draft

- **P1** · 10 min
- **Files:** `components/farmer/SellWizard.tsx`
- **Do:**
    - Mirror the wizard state to `localStorage['ps_sell_draft']` on every change, wrapped in try/catch. Restore it on mount; clear it after publishing.
    - Use `useOnline()` from C: when offline, disable ✓ on F7 and play `offline`.
- **Done when:** reloading in the middle of the wizard keeps the answers.

### B3.4: Decline an offer, and the history list

- **P1** · 10 min · **Depends on:** A3.6
- **Files:** `components/farmer/OfferCard.tsx`, `app/f/saudas/page.tsx`
- **Do:**
    - Add a "یہ نہیں" (not this one) button → `rejectBid`, behind the confirm sheet.
    - Add a settled history section with "total earned" (the sum of `final_amount` over settled saudas).
- **Done when:** a declined offer disappears from F8; Naseem's history shows Rs 2,28,800.

---

## Workstream C

### C3.1: Real `CameraCapture` (**unblocks** B3.2, D3.1)

- **P1** · 30 min
- **Read first:** 07-voice (`CameraCapture`), 02 (Evidence a reviewer can trust)
- **Files:** `components/media/CameraCapture.tsx`
- **Do:**
    1. An in-page camera: `getUserMedia({ video: { facingMode: 'environment' } })`, a `<video>` preview and a large shutter button.
    2. Draw the frame to a `<canvas>` and export a JPEG `File` (quality 0.8, max side 1600 px).
    3. Get the location with `navigator.geolocation.getCurrentPosition` (5 s timeout; `null` if denied).
    4. Overlay the `hint` on the preview. Allow a retake.
    5. **No gallery picker.** If `getUserMedia` is unavailable, fall back to `<input capture="environment">` and label it "fallback camera".
    6. Stop the camera tracks on unmount.
- **Done when:** on the phone, the buyer flow captures a photo with coordinates, and the image is under 1 MB.

### C3.2: TTS budget check

- **P1** · 10 min
- **Do:**
    - Check the Uplift usage page. If more than 70% is used, set `NEXT_PUBLIC_TTS_DISABLED=1` everywhere except production. Tell the team.
    - Pre-warm the demo's dynamic sentences: open each farmer screen of the demo once on production so the server cache holds them.
- **Done when:** the remaining minutes cover at least 3 full demo runs.

---

## Workstream D

### D3.3: Reset button and `/admin/users` (do first: rehearsals depend on it)

- **P1** · 15 min · **Depends on:** A3.5, A3.4
- **Files:** `app/admin/page.tsx`, `components/admin/ResetDemoButton.tsx`, `app/admin/users/page.tsx`, `components/admin/VerifyToggle.tsx`
- **Do:**
    - **Reset:** a confirm dialog ("This wipes all demo deals for everyone"), then `resetDemo`.
    - **Users:** a wholesalers table with a verified switch → `setVerified`.
- **Done when:** reset restores the seed; toggling verification changes the badge on `/market` cards and offers.

### D3.1: Photo on collection, and evidence in the dispute view

- **P1** · 20 min · **Depends on:** A3.3, C3.1
- **Files:** `components/buyer/CollectionForm.tsx`, `components/admin/EvidenceCompare.tsx`
- **Do:**
    - **Collection form:** `CameraCapture` with hint "Photo must show the farmer's code {collection_code} on his phone and 3 opened sample bags". Upload with `uploadEvidence(kind='collection')` before `recordCollection`. Require at least one photo, but allow "skip (demo)" with a warning.
    - **EvidenceCompare:** the photos per side with `captured_at`, a distance-from-the-other-photos hint if both have coordinates (simple haversine; optional), and the code to check by eye.
- **Done when:** the reviewer sees the buyer's photo, showing the code, next to the farmer's photo.

### D3.2: Cancel buttons

- **P1** · 15 min · **Depends on:** A2.6
- **Files:** `components/buyer/SaudaActions.tsx`, `components/admin/RulingForm.tsx`
- **Do:**
    - **Buyer:** "Walk away" on `token_due` / `awaiting_collection`, behind a confirm dialog ("your token goes to the farmer"). "Cancel: shortfall" on `collected`, only if `isShortfall`.
    - **Admin:** "Evidence inconclusive" → `cancelSauda('dispute_unresolved')`.
- **Done when:** each button produces the right `cancel_reason` and `token_to` (check the timeline).

### D3.4: Pitch slides final

- **P0 for the pitch** · rest of the phase
- **Files:** `pitch/**`
- **Do:**
    - Finish the 5 slides from `08-demo-and-rehearsal.md`.
    - Put the real AMIS figure and date on the honesty slide, if D0.1 succeeded.
    - Use only facts with sources.
- **Done when:** the slides are reviewed by one teammate.

---

## 4:15 FREEZE

A merges every branch that passes `typecheck`, `test` and `build`, in the order A → C → B → D, and deploys production. After this, only demo-breaking bugs get fixed (Phase 4).
