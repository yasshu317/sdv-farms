# Demo data & how “Interested” appears in the UI

After **`git checkout main`** and **`git pull`**, seed **10 approved listings** and **shortlist (“Interest”) counts** locally or on Supabase using the script below.

## 1. Seed demo listings + wishlist (service role)

1. `.env.local` must include **`SUPABASE_SERVICE_ROLE_KEY`** plus `NEXT_PUBLIC_SUPABASE_URL`.

2. Ensure test accounts exist:

   ```bash
   node scripts/seed-test-users.mjs
   ```

   Defaults include **seller** `yashfse@gmail.com` and buyer **`rorchow@gmail.com`** (see `scripts/seed-test-users.mjs`).

3. Run demo seed:

   ```bash
   npm run seed:demo-listings
   ```

   Optional env:

   - `DEMO_SELLER_EMAIL` — seller who “owns” the 10 demos (default `yashfse@gmail.com`).
   - `DEMO_BUYER_EMAIL` — buyer who gets ♥ rows (default `rorchow@gmail.com`).
   - `DEMO_WISHLIST_COUNT` — how many of the 10 demos are on that buyer’s shortlist (default `4`, max `10`).

   Listings use **`property_id`** values `SDV-DEMO-001` … **`SDV-DEMO-010`**. Re-running the script deletes those demos for that seller only, then inserts again.

---

## 2. What shows up **where** (two different meanings)

### A. Shortlist = “Interested” ♥ counts (seller-facing)

| Action | Storage | Where it shows |
|--------|---------|----------------|
| Signed-in buyer taps **♥** on `/properties` or PDP | `buyer_wishlist` | **Seller dashboard** `/seller`: total **Interested** in the KPI row, and **per-listing ♥ count** on each approved property card. |

The **buyer** sees the same listings under **`/dashboard?tab=land-shortlist`**.

Logging in as **`rorchow@gmail.com`** after seeding, you’ll already have **wishlist rows** on the first *N* demo properties — no need to click ♥ manually for counts to appear **as seller** (`yashfse@gmail.com`).

### B. Site visit picker (“Interested” CTA → appointment)

| Action | Storage | Where it shows |
|--------|---------|----------------|
| Buyer taps **Interested** → date/slot picker | `appointments` (when submitted) | **Admin → Appointments**; flows involving email / Razorpay follow `AppointmentPicker` + `/api/payment/*`. |

This path is separate from ♥ **`buyer_wishlist`** — you can demo both: seed gives **wishlist counts** immediately; bookings require going through **Interested** on a listing.

---

## 3. Smoke checklist

1. **`/properties`** — should list **≥ 10** new rows (unless filters hide them).

2. **Log in as seller** (`yashfse@gmail.com`) → **`/seller`** — **Interested** total and per-row ♥ counts match `DEMO_WISHLIST_COUNT` for seeded buyer.

3. **Log in as buyer** (`rorchow@gmail.com`) → **`/dashboard?tab=land-shortlist`** — same *N* properties listed.

4. **As buyer**, open **`/properties/{id}?book=1`** to exercise the **appointment** Interested flow separately from shortlist.
