---
name: sdv-farms-admin-ops
description: >-
  SDV Farms admin and operations hub — staff vs admin, AdminClient tabs, phase8–9,
  buyer_request_notes, feature_flags / Flags tab, and API boundaries. Use when
  changing /admin, proxy.js, RLS for admin/staff, buyer land request workflow,
  appointments assignment, plot verification, /api/admin/users, or remote config.
---

# SDV Farms — Admin / ops hub

## Role split
- **Staff** — `/admin` hub, edit listings, plots, appointments, buyer requests, services; **no** Users tab, **no** approve/reject pending listings, **no** `/admin/property/new` (server redirect).
- **Admin** — all of the above **plus** user role API, new property shortcut, approve/reject.

## Code touchpoints
- `src/app/admin/page.jsx` — pass `viewerRole`, `buyerRequestNotesById`, **`featureFlags`** (tolerates missing table pre-migration).
- `src/app/admin/AdminClient.jsx` — tab visibility, property actions, requests SDVF/ops/notes, **Flags** tab (remote config CRUD).
- `src/app/api/admin/users/route.js` — **admin-only** `requireAdmin()`; `PATCH` merges `user_metadata` before `updateUserById`; `GET` can attach `occupation` from `profiles` via service client.
- `src/app/api/feature-flags/route.js` — public `GET` map of `{ key → { enabled, payload } }` (no secrets in `payload`).
- `src/lib/featureFlags.js` — normalize rows to a map.

## Schema reference
- Run `supabase/migrations/phase8_admin_ops_hub.sql` after earlier phases; needs phase 3 tables for service/payment policy lines at end.
- Phase 9: `phase9_feature_flags.sql` — `feature_flags` (`key`, `enabled`, `payload`, `metadata`, `sort_order`); **Flags** tab; **do not store secrets** in `payload`.
- Phase 8 additions: `profiles.occupation`; plot verification columns; `seller_properties.seller_interest`; buyer request SDVF/residence fields; appointments assignment/SLA; table `buyer_request_notes`.

## Testing
- After UI changes: `npm test` and `npm run build`.
