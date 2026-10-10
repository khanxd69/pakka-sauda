# 03: Data model

The database is Supabase Postgres. The source of truth is `context/reference/supabase/schema.sql`, copied to `supabase/schema.sql` in Phase 0. It was tested on Postgres (PGlite): the schema, the seed, `accept_bid` (including the double-accept refusal) and `reset_demo` (run twice) all work.

## Tables

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | Demo users | `role` (farmer/wholesaler/admin), `name`, `name_ur`, `district`, `business_name`, `verified` |
| `reference_prices` | AMIS prices, entered by hand | `market`, `price_per_kg`, `source`, `source_price`, `source_unit`, `source_date` |
| `listings` | Farmer crop listings | `qty_low_kg`, `qty_high_kg`, `expected_grade`, `min_price_per_kg`, `ready_from`, `ready_to`, `status` |
| `bids` | Grade-price ladders | `price_a`, `price_b` (null = not accepted), `price_c`, `collection_date`, `loading_paid_by`, `status`; **unique (listing_id, wholesaler_id)** |
| `saudas` | Accepted deals | `terms` (frozen JSON), `status`, `token_*`, `collection_code`, `weighed_kg`, `delivered_grade`, `farmer_claimed_grade`, `resolved_grade`, `final_amount`, `platform_fee`, `cancel_reason`, `token_to`, timestamps |
| `evidence` | Photos (P1) | `sauda_id`, `uploaded_by`, `kind` (collection/dispute), `url`, `lat`, `lng`, `captured_at` (set by the server) |
| `sauda_events` | Audit trail / timeline | `sauda_id`, `actor_id`, `type`, `payload` |

### Enums

- `sauda_status`: `token_due` → `awaiting_collection` → `collected` → (`disputed`) → `agreed` → `settled`; or `cancelled`.
- `cancel_reason_t`: `token_expired`, `grade_not_accepted`, `shortfall`, `buyer_walked_away`, `crop_loss`, `farmer_sold_elsewhere`, `dispute_unresolved`.

### `saudas.terms` (frozen at accept; TypeScript type `SaudaTerms`)

```json
{ "price": { "A": 45, "B": 39, "C": null }, "qty_low_kg": 9000, "qty_high_kg": 11000, "expected_grade": "A",
  "collection_date": "2026-10-14", "loading_paid_by": "buyer", "fee_percent": 1, "token_amount": 45000 }
```

## Functions

- **`accept_bid(p_bid uuid, p_token_pct=10, p_fee_pct=1, p_token_window_minutes=30) returns uuid`**
    - Atomic accept: creates the sauda, accepts the chosen bid, rejects the other pending bids, marks the listing sold and writes a `created` event.
    - Raises `BID_NOT_PENDING` or `LISTING_NOT_OPEN`.
    - Call it with `db().rpc('accept_bid', { p_bid: bidId, p_token_pct: CONFIG.TOKEN_PERCENT, p_fee_pct: CONFIG.FEE_PERCENT, p_token_window_minutes: CONFIG.TOKEN_WINDOW_MINUTES })`.
- **`reset_demo() returns void`**
    - Deletes all demo rows except `reference_prices` and re-inserts the seed.
    - Used during rehearsals via the admin "Reset demo" button (P1), or run `select reset_demo();` in the Supabase SQL editor.

## Files

| File | Owner | When |
|---|---|---|
| `supabase/schema.sql` | A | Run once, Phase 0 (A0.6) |
| `supabase/seed.sql` | A | Run once after the schema; defines and calls `reset_demo()` |
| `supabase/seed-prices.sql` | **D** | Run on the morning of the build, with real AMIS numbers (D0.2) |
| `supabase/storage.sql` | A | Run once (public `evidence` bucket; P1) |
| `supabase/patches/NNN_*.sql` | A | Only if a schema change is unavoidable; announce in team chat |

## Rules for code that touches the database

- Only `lib/db.ts` creates a client (service role). Only server code imports it.
- `numeric` columns may arrive as strings. Map rows through `toNum` / `toNumOrNull` in `lib/queries.ts` and `lib/transition.ts` so the rest of the app always gets numbers. JSON `terms` values are already numbers.
- RLS is enabled with **no policies**, so the anon key can't read anything and the service role bypasses RLS. Don't add policies, and don't ship the anon key to the browser.
- Dates are `date` columns, sent and received as `'YYYY-MM-DD'` strings.

## Seed scenario (fixed IDs; mirrored in `lib/fixtures.ts`)

| ID suffix | What | State |
|---|---|---|
| `…0101` Rashid, `…0102` Naseem Bibi, `…0103` Akram | Farmers, Okara | n/a |
| `…0201` Imran Traders ✓, `…0202` Lahore Fresh ✓, `…0203` Pak Agro Buyers (unverified) | Wholesalers, Lahore | n/a |
| `…0301` Reviewer | Admin | n/a |
| `…1001` | Rashid, 8,000–9,000 kg, A, min 38 | sold |
| `…1002` | Naseem, 6,000–7,000 kg, A, min 36, ready in 3–7 days | open, 1 pending bid (Lahore Fresh 42/37/–) |
| `…1003` | Naseem, 5,000–5,500 kg | sold, settled history |
| `…1004` | Akram, 12,000–14,000 kg, B, min 33, ready in 7–14 days | open, 1 pending bid (Imran 40/36/28, farmer pays loading) |
| `…3001` | **Dispute scene:** Rashid ↔ Imran, ladder 45/39/30, 8,000 kg recorded as **C** = Rs 240,000 | `collected` (Rashid disputes live; the reviewer rules B, giving Rs 312,000) |
| `…3002` | Naseem ↔ Lahore Fresh, 5,200 kg A at 44 = Rs 228,800, fee 2,288 | `settled` (gives the admin tiles real numbers) |

Full IDs are `00000000-0000-4000-8000-00000000XXXX`. The live demo listing (Rashid, 10,000 kg) is created during the demo, not seeded.

Reference prices (`seed-prices.sql`) are **ILLUSTRATIVE** until D replaces them: Lahore Rs 50/kg, Okara Rs 46/kg. The bids sit slightly below the mandi rate, which is realistic for farm-gate prices.
