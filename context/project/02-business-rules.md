# 02: Business rules

Every outcome follows a rule. Nobody, human or AI, uses judgement except a reviewer deciding a disputed grade. The code lives in:

- `lib/settle.ts` (money)
- `lib/sauda-machine.ts` (state)
- `lib/rules.ts` (bid validation)
- `lib/net.ts` (farmer comparison)

All of these are tested in `lib/core.test.ts`.

## Settlement formula

```
final_amount       = weighed_kg × price[grade]          (price per kg from the bid's ladder)
platform_fee       = round(final_amount × 1%, 2)        (paid by the buyer, on top)
balance_at_loading = final_amount − token_amount        (negative = farmer refunds the difference)
farmer_receives    = final_amount                       (the farmer is never charged)
buyer_pays         = final_amount + platform_fee
token_amount       = 10% × ((qty_low + qty_high) / 2) × price[expected_grade]   (grade A price if expected grade unpriced)
```

### Worked example (unit tested)

- Rashid lists 9,000–11,000 kg, expected grade A, minimum Rs 38/kg (Rs 1,520 per mann).
- Imran bids A = Rs 45, B = Rs 39, C = not accepted; buyer pays loading.
- Token = 10% × 10,000 × 45 = **Rs 45,000**.
- At collection: 9,200 kg, grade B. Final = 9,200 × 39 = **Rs 358,800**.
- Balance at loading = Rs 313,800. Fee = Rs 3,588, so the buyer pays Rs 362,388 in total. Rashid receives Rs 358,800.

## Rules table

| Situation | Rule | Token | Priority |
|---|---|---|---|
| Bid below the farmer's minimum | Refused: `BELOW_MINIMUM` if the price for the **expected grade** is below `min_price_per_kg` | n/a | P0 |
| Expected grade not priced | Refused: `EXPECTED_GRADE_NOT_PRICED` | n/a | P0 |
| Ladder goes up (B > A, or C > B) | Refused: `LADDER_NOT_DESCENDING` | n/a | P0 |
| Collection date before ready date | Refused: `COLLECTION_BEFORE_READY` | n/a | P0 |
| New bid from the same buyer on the same listing | Upsert: replaces his old bid, status back to `pending` | n/a | P0 |
| Farmer accepts | One SQL transaction (`accept_bid`): sauda created, chosen bid `accepted`, other pending bids `rejected`, listing `sold` | Due | P0 |
| Token not paid within 30 min | Cancel `token_expired`; listing reopens | None paid | P1 |
| Weight inside or a little below the range | Buyer pays for the kg weighed; no penalty | Counts toward payment | P0 |
| Weight below 80% of the low estimate | Buyer may cancel (`shortfall`) after recording | Returned to buyer | P1 |
| Weight above the high estimate | Buyer records only the kg he takes, at the same price | Counts toward payment | P0 (no code) |
| Recorded grade has a price | Farmer confirms → `agreed` at that price | Counts toward payment | P0 |
| Recorded grade has no price | Farmer confirms → `cancelled` (`grade_not_accepted`). The farmer is free to sell elsewhere. | Returned to buyer | P0 |
| Farmer disputes the grade | → `disputed`. Nothing is loaded and nothing beyond the token is paid until the reviewer rules. | Held | P0 |
| Reviewer rules a priced grade | → `agreed`, amount recalculated with `settle()` | Counts toward payment | P0 |
| Reviewer rules an unpriced grade | → `cancelled` (`grade_not_accepted`) | Returned to buyer | P0 |
| Evidence can't settle it | → `cancelled` (`dispute_unresolved`). The crop stays with the farmer. | Returned to buyer | P1 |
| Buyer walks away (no listed reason) | → `cancelled` (`buyer_walked_away`); recorded on the buyer's history | **Goes to farmer** | P1 |
| Crop destroyed by weather or pests (reviewer verifies) | → `cancelled` (`crop_loss`), no penalty | Returned to buyer | P2 |
| Farmer sold elsewhere after the token | → `cancelled` (`farmer_sold_elsewhere`); recorded on the farmer's history | Returned to buyer | P2 |
| Settlement | → `settled` only when the **farmer** confirms the balance was received. The fee counts as revenue only then. | n/a | P0 |

## Who may do what (`lib/sauda-machine.ts`)

| Action | From | To | Role |
|---|---|---|---|
| `payToken` | token_due | awaiting_collection | wholesaler (party) |
| `recordCollection` | awaiting_collection | collected | wholesaler (party) |
| `farmerConfirm` | collected | agreed / cancelled | farmer (party) |
| `farmerDispute` | collected | disputed | farmer (party) |
| `resolveDispute` | disputed | agreed / cancelled | admin |
| `confirmBalanceReceived` | agreed | settled | farmer (party) |
| cancel `token_expired` | token_due | cancelled | system/admin |
| cancel `grade_not_accepted` | collected, disputed | cancelled | farmer, admin |
| cancel `shortfall` | collected | cancelled | wholesaler |
| cancel `buyer_walked_away` | token_due, awaiting_collection | cancelled | wholesaler, admin |
| cancel `crop_loss`, `farmer_sold_elsewhere` | awaiting_collection | cancelled | admin |
| cancel `dispute_unresolved` | disputed | cancelled | admin |

## Why a buyer can't just downgrade to save money

- He set the grade B price himself in his bid.
- Grade C is either priced by him too, or "not accepted". In that case he walks away with nothing, and only after the farmer agrees or a reviewer rules.
- Every grade claim carries a photo (P1: live camera, a one-time code, a time and location stamp).
- The farmer can dispute with one tap.
- The crop doesn't leave until the grade is settled.

## Evidence a reviewer can trust (P1)

| Threat | Countermeasure |
|---|---|
| Old or downloaded photo | In-page live camera only (`getUserMedia`); no gallery. The server stamps the time and saves the browser's location for comparison with the farm. |
| Someone else's crop, or a staged shot | When the token is paid, the server issues a one-time 4-digit `collection_code`, shown on the farmer's phone (F9). The buyer's photo must show it. |
| Only the best or worst bags shown | The farmer picks 3 sample bags; each is photographed opened next to a printed size card. This is a process instruction shown on screen; no code. |
| Only one side's evidence | The farmer adds his own photos when disputing; the reviewer sees both sets side by side. |
| Evidence can't settle it | `dispute_unresolved`: the crop stays with the farmer and the token is returned. Pilot: an in-person assessor. |

## Net comparison ("what reaches your hand", F8)

```
mandi_net_per_kg = reference_price × (1 − 3% commission) − transport 2.5 − labour 0.75   (ILLUSTRATIVE costs)
offer_net_per_kg = offer_price − (labour 0.75 if the farmer pays loading)
```

Show both totals for the farmer's estimate. Never claim one route is always better.
