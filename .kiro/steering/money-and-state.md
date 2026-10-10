---
inclusion: fileMatch
fileMatchPattern: ["lib/settle.ts", "lib/net.ts", "lib/sauda-machine.ts", "lib/transition.ts", "lib/rules.ts", "app/actions/**", "supabase/**"]
---
# Money and state rules

- `settle(terms, weighedKg, grade)` is the only source of final amount, fee, balance and buyer-pays. Store its numbers on the sauda row (`final_amount`, `platform_fee`); never recompute them differently anywhere.
- The token is computed in SQL (`accept_bid`) and mirrored by `tokenAmount()` in TypeScript. If you change one, change both and the test.
- Status changes:
    - Use `applyTransition({ saudaId, action, actor, to, patch, event })` or `applyCancel({ saudaId, reason, actor })`.
    - Both check the role, the allowed previous status and that the actor is a party to the sauda.
    - Both use an optimistic lock (`.eq('status', previous)`) and write one `sauda_events` row.
- Transitions (`lib/sauda-machine.ts`):
    - `token_due` → `awaiting_collection` (payToken, buyer)
    - `awaiting_collection` → `collected` (recordCollection, buyer)
    - `collected` → `agreed` | `cancelled` (farmerConfirm, farmer; cancelled when the recorded grade has no price)
    - `collected` → `disputed` (farmerDispute, farmer)
    - `disputed` → `agreed` | `cancelled` (resolveDispute, admin)
    - `agreed` → `settled` (confirmBalanceReceived, farmer)
    - Cancel reasons and who keeps the token: `CANCEL_RULES`.
- The farmer is never charged. `farmerReceives = finalAmount`. The fee is the buyer's.
- An unpriced grade (`price[grade] === null`) is never paid at another grade's price. It means the buyer may walk away and gets his token back, but only after the farmer agrees or a reviewer rules.
- Every action that changes money or status needs a test of its pure logic, or must reuse already-tested functions.
