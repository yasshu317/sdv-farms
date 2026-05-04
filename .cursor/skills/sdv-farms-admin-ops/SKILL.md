---
name: sdv-farms-admin-ops
description: >-
  SDV Farms admin and operations hub — staff vs admin, AdminClient tabs, phase8
  columns, buyer_request_notes, and API boundaries. Use when changing /admin,
  proxy.js, RLS for admin/staff, buyer land request workflow, appointments
  assignment, plot verification, or /api/admin/users.
---

# SDV Farms — Admin / ops hub

## Role split
- **Staff** — `/admin` hub, edit listings, plots, appointments, buyer requests, services; **no** Users tab, **no** approve/reject pending listings, **no** `/admin/property/new` (server redirect).
- **Admin** — all of the above **plus** user role API, new property shortcut, approve/reject.

## Code touchpoints
- `src/app/admin/page.jsx` — pass `viewerRole`, `buyerRequestNotesById` (notes query tolerates missing table pre-migration).
- `src/app/admin/AdminClient.jsx` — tab visibility, property actions, requests SDVF/ops/notes.
- `src/app/api/admin/users/route.js` — **admin-only** `requireAdmin()`; `PATCH` merges `user_metadata` before `updateUserById`; `GET` can attach `occupation` from `profiles` via service client.

## Schema reference
- Run `supabase/migrations/phase8_admin_ops_hub.sql` after earlier phases; needs phase 3 tables for service/payment policy lines at end.
- New columns: `profiles.occupation`; plot `document_status`, `legal_verify_status`, `physical_verify_status`; `seller_properties.seller_interest`; `buyer_requests` residence + `ops_comment`, `sdvf_*`; `appointments` `assigned_to`, `related_buyer_request_id`, `sla_target_at`; table `buyer_request_notes`.

## Testing
- After UI changes: `npm test` and `npm run build`.
