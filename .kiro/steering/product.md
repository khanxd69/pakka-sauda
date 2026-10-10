---
inclusion: always
---
# Product: Pakka Sauda

"Pakka sauda" means a firm, settled deal. Pitch line: *Other apps digitise the listing. Pakka Sauda digitises the handshake, and makes it hold at the farm gate.*

- **Users:**
    - **Farmer:** low literacy, Urdu speaker, cheap Android phone.
    - **Wholesaler:** a Lahore mandi trader on a laptop or phone.
    - **Admin:** a reviewer who settles grade disputes.
- **Scope:** one crop (potatoes) and one district (Okara, with buyers in Lahore). Sales happen near harvest: the crop is ready within 0–14 days.
- **The one deal the demo must show:**
    1. Listing by voice, with the details read back.
    2. Bids, each with a grade-price ladder (Rs/kg for A, B, C; null = grade not accepted).
    3. Accept, which creates the sauda.
    4. Token paid (simulated).
    5. Collection: the buyer records weight, grade and a photo.
    6. The farmer confirms, or disputes and an admin rules.
    7. Balance received, then settled. The 1% fee is paid by the buyer.
- **Payment rule:** final amount = weighed kg × the ladder price for the delivered grade. The farmer is never charged.
- **Protection:** the crop doesn't leave the farm until the farmer agrees with the grade. Disputes are decided by a person using evidence, never by AI.
- **What's simulated:** money movement, buyer verification checks and reviewer qualifications. These are labelled DEMO or ILLUSTRATIVE in the UI.

Detailed context: `context/project/01-product.md` and `context/project/02-business-rules.md`.
