# Requirements: Pakka Sauda MVP

The full detail lives in `context/project/*.md`. This file restates the requirements in Kiro's format so Kiro tasks can trace them. Priorities: P0 (demo), P1 (convincing), P2 (spare time).

## 1. Demo sign-in (P0)
**User story:** As a demo presenter, I want to switch between seeded users without passwords, so the demo flows quickly.
1. WHEN a user taps a profile on `/` THE SYSTEM SHALL set the `ps_uid` and `ps_role` cookies and redirect to `/f`, `/market` or `/admin` by role.
2. WHEN a user without the matching role opens a protected route prefix THE SYSTEM SHALL redirect to `/`.
3. THE SYSTEM SHALL check the role again in every server action with `requireUser`.

## 2. Voice-guided listing (P0)
**User story:** As a farmer who may not read, I want to list my crop by listening and tapping or speaking, so I can sell without forms.
1. WHEN a farmer screen opens THE SYSTEM SHALL play its Urdu prompt and show a replay button.
2. THE SYSTEM SHALL ask one question per screen: crop, quantity, ready time, quality, minimum price per mann.
3. WHEN the farmer enters a quantity estimate THE SYSTEM SHALL store a ±10% range in kg.
4. BEFORE publishing THE SYSTEM SHALL read the listing back in Urdu and require a ✓ confirmation.
5. IF voice input fails THEN THE SYSTEM SHALL keep the number pad usable and play a retry prompt.

## 3. Grade-price ladder bids (P0)
**User story:** As a wholesaler, I want to bid a price per kg for each grade, so the lower-grade price is agreed before collection.
1. THE SYSTEM SHALL require a grade A price and accept null for B or C ("not accepted").
2. IF the price for the farmer's expected grade is missing or below his minimum THEN THE SYSTEM SHALL reject the bid with a clear message.
3. IF the ladder rises (B > A or C > B) or the collection date is before the ready date THEN THE SYSTEM SHALL reject the bid.
4. WHEN a wholesaler bids again on the same listing THE SYSTEM SHALL replace his previous bid.
5. WHILE the form is filled THE SYSTEM SHALL preview the value at low, mid and high quantity per grade, the token and the fee.

## 4. Offers and acceptance (P0)
**User story:** As a farmer, I want to hear each offer and what would reach my hand, so I can choose.
1. THE SYSTEM SHALL speak each offer in Urdu, including per-mann prices for each grade and who pays loading.
2. THE SYSTEM SHALL show an estimate of the farmer's net from the offer next to the mandi route (reference price minus commission, transport and labour), labelled as an estimate.
3. WHEN the farmer confirms acceptance THE SYSTEM SHALL, in one transaction, create a sauda with frozen terms, accept the bid, reject the other pending bids and mark the listing sold.

## 5. Token (P0, simulated)
1. WHEN a sauda is created THE SYSTEM SHALL set the token to 10% of the mid-range quantity × the expected grade's price, due within 30 minutes.
2. WHEN the buyer taps Pay token THE SYSTEM SHALL move the sauda to awaiting_collection and label the step DEMO.
3. (P1) IF the token is paid after its deadline THEN THE SYSTEM SHALL cancel the sauda (token_expired) and reopen the listing.

## 6. Collection and settlement (P0)
**User story:** As both parties, I want the payment calculated by a fixed rule from weight and grade, so neither side can change the deal at the farm gate.
1. WHEN the buyer records weighed kg and grade THE SYSTEM SHALL calculate final amount = weighed kg × the ladder price for that grade, plus a 1% buyer fee, a balance net of the token, and what the buyer pays.
2. THE SYSTEM SHALL speak the recorded weight, grade, total, token and balance to the farmer and ask him to confirm or dispute.
3. WHEN the farmer confirms a priced grade THE SYSTEM SHALL mark the sauda agreed.
4. WHEN the farmer confirms an unpriced grade THE SYSTEM SHALL cancel the sauda (grade_not_accepted) with the token returned to the buyer.
5. WHEN the farmer confirms he received the balance THE SYSTEM SHALL mark the sauda settled and count the fee as revenue.
6. THE SYSTEM SHALL never charge the farmer.

## 7. Disputes (P0)
**User story:** As a farmer, I want to dispute a wrong grade and keep my crop until a person decides.
1. WHEN the farmer disputes THE SYSTEM SHALL record his claimed grade and reason, set the sauda to disputed, and tell him the crop stays with him.
2. THE SYSTEM SHALL show the reviewer both sides' claims and evidence side by side.
3. WHEN the reviewer rules a priced grade THE SYSTEM SHALL recalculate with the settlement rule and set the sauda to agreed. An unpriced grade cancels it with the token returned to the buyer.
4. THE SYSTEM SHALL never let AI decide a grade or an amount.

## 8. Evidence (P1)
1. THE SYSTEM SHALL capture photos with an in-page live camera (no gallery), store a server timestamp and the browser's location.
2. WHEN the token is paid THE SYSTEM SHALL issue a one-time 4-digit collection code shown on the farmer's phone, for the buyer's photo.

## 9. Audit trail and integrity (P0)
1. THE SYSTEM SHALL change a sauda's status only through allowed transitions, by an allowed role that is a party to the sauda (admin excepted), and SHALL write one event per change.
2. IF two updates race THEN THE SYSTEM SHALL apply only the first and report CONCURRENT_UPDATE for the second.

## 10. Admin (P0 / P1)
1. THE SYSTEM SHALL show settled value, fee revenue, active listings, open disputes and saudas by status (P0).
2. (P1) THE SYSTEM SHALL let the admin verify wholesalers and reset the demo data.

## 11. Honesty (P0)
1. THE SYSTEM SHALL show the source and date of every reference price, and label placeholders ILLUSTRATIVE.
2. THE SYSTEM SHALL label every simulated money step DEMO.
