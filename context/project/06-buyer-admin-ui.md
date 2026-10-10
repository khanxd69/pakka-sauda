# 06: Wholesaler dashboard and admin (Workstream D)

These are normal, fast web pages in English with shadcn/ui. They must work on a laptop and be usable on a phone. Polling is done with `<AutoRefresh seconds={3} />` on pages whose data other people change.

## `/`: Choose demo user (`app/page.tsx`)

- Title: "Pakka Sauda: demo". Subtitle: "Choose who you are. No password: this is a demo."
- Three groups of big cards: **Farmers** (Rashid, Naseem Bibi, Akram), **Wholesalers** (Imran Traders ✓, Lahore Fresh ✓, Pak Agro Buyers), **Reviewer**.
- Each card is a `<form action={setDemoUser.bind(null, id)}>` with a button. That tap also unlocks audio autoplay for the farmer.
- Footer: "All prices ILLUSTRATIVE unless marked AMIS."

## Buyer navigation: `components/buyer/BuyerNav.tsx`

- Links: Market · My bids · My saudas.
- Shows the business name, a verified badge, and a "Switch user" link to `signOut`.
- Used by the `app/market/layout.tsx`, `app/bids/layout.tsx` and `app/saudas/layout.tsx` layouts.

## `/market`: Listing grid

- Filters via the URL query (`?district=&grade=&readyBy=`), passed to `getOpenListings`. Use plain `<form method="get">` selects: no client state needed.
- A reference price strip at the top: "AMIS Lahore potato Rs 50/kg (Rs 2,000/mann), <date>". Show the `source` word, including ILLUSTRATIVE.
- **Card** (`components/buyer/ListingCard.tsx`):
    - 🥔 Potato, district;
    - quantity range (kg + mann);
    - expected grade badge;
    - ready window (`formatDate`);
    - farmer's minimum Rs/kg (and per mann);
    - "Declared by farmer" badge;
    - pending bid count.

    Clicking it opens `/market/[id]`.

## `/market/[id]`: Listing detail and bid form

- **Left / top:** the farmer-declared facts, clearly labelled "Declared by farmer, not inspected", and the reference price.
- **Bid form** (`components/buyer/BidForm.tsx`, client):
    - Price per kg for Grade A (required), B (number or "Don't accept B" checkbox → null), C (same).
    - Collection date (default `ready_from`).
    - Loading paid by: Buyer (default) / Farmer.
    - Note (optional).
    - **Live preview** from `bidPreview(listing, {A,B,C})`: a table of grade × value at low / mid / high quantity, then "Token if accepted: Rs X (DEMO)" and "Platform fee 1% at expected mid: Rs Y".
    - Client-side check with `validateBid` before submit, showing `BID_ERROR_TEXT`.
    - Submit calls `placeBid`. On `ok`, toast "Bid placed".
    - If he already has a pending bid, prefill it and label the button "Update bid".
- **Below:** "Your bids on this listing" (from `getMyBids`, filtered to this listing).

## `/bids`: My bids

A table: listing (quantity, district), ladder A/B/C, collection date, status badge. Pending rows have a **Withdraw** button (`withdrawBid`). Accepted rows link to the sauda.

## `/saudas`: My saudas

A table or cards: farmer, quantity range, ladder, status (`STATUS_LABEL[status].en`) and **next action** text per status:

| Status | Next action shown |
|---|---|
| `token_due` | "Pay token by HH:MM" |
| `awaiting_collection` | "Collect on <date>" |
| `collected` | "Waiting for farmer" |
| `disputed` | "Under review" |
| `agreed` | "Pay balance Rs X at loading" |
| `settled` | "Settled" |
| `cancelled` | Reason |

## `/saudas/[id]`: Sauda detail (party check, else `notFound()`)

- **Terms card** (frozen `terms`): ladder, quantity range, expected grade, collection date, loading, token, fee %.
- **Timeline** from `getSaudaEvents` (type, time, actor).
- **Status panel:**

| Status | Panel |
|---|---|
| `token_due` | Countdown to `token_due_by`. **Pay token (DEMO)** → `payToken`. Shows `DemoBadge`. |
| `awaiting_collection` | **Collection form** (`components/buyer/CollectionForm.tsx`, client): weighed kg, grade (A/B/C radio), note; P1: `CameraCapture` with hint "Photo must show the farmer's code on his phone and 3 opened sample bags", uploaded via `uploadEvidence(kind='collection')` before submit. **Live preview** from `settle(terms, kg, grade)`: price/kg, total, token already paid, balance at loading, fee, you pay. If the grade has no price: a red note "You did not price grade C: submitting records the grade; if the farmer agrees, the sauda is cancelled and your token is returned." Submit → `recordCollection`. P1: a "Walk away" button → `cancelSauda('buyer_walked_away')` with a confirm dialog: "Your token goes to the farmer". |
| `collected` | "Waiting for the farmer to confirm." P1: if `isShortfall` → a **Cancel: shortfall** button. |
| `disputed` | "Under review by a neutral reviewer. Do not load." |
| `agreed` | "Pay the balance Rs X to the farmer at loading (outside the app). The farmer confirms receipt." `DemoBadge`. |
| `settled` | Summary with fee charged. |
| `cancelled` | Reason, token destination. |

## `/admin`: Reviewer dashboard

- **Tiles** (from `getAdminStats`): settled deal value, fee revenue, active listings, open disputes, saudas by status (small table), farmers / wholesalers counts.
- **Disputes queue:** each row links to `/admin/disputes/[id]`, oldest first.
- P1: a **Reset demo** button (confirm dialog) → `resetDemo`. Show it only when `CONFIG.DEMO_MODE`.

## `/admin/disputes/[id]`: Evidence and ruling

- **Side by side:**

| Buyer's claim | Farmer's claim |
|---|---|
| Grade recorded | Grade claimed |
| Buyer note | Reason chips |
| Collection photos (P1): time, location and the code to check | Farmer's photos (P1) |

- **Also show:** the expected grade at listing, the ladder, the weight, and the collection code (so the reviewer can compare it with the photo).
- **Ruling form:**
    - grade (A/B/C);
    - a required note;
    - a preview of the new amount from `settle()`.

    Submitting calls `resolveDispute`.
- P1: an **Evidence inconclusive** button → `cancelSauda('dispute_unresolved')`: the crop stays with the farmer and the token is returned.

## `/admin/users` (P1)

The wholesalers table with a verified switch → `setVerified`.

## Done-when checks for the dashboard

- Works at 1280 px and at 390 px.
- Every money figure comes from `bidPreview` / `settle` / sauda columns.
- Every simulated money step shows `DemoBadge`.
- Every error string from §9 of `04-contracts.md` is mapped to a readable message.
