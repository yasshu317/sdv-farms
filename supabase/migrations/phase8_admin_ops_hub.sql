-- Phase 8 — Admin / operations hub: profile & plot verification, buyer-request SDVF workflow,
-- appointment assignment, staff role on key tables, buyer_request notes.

-- ── 1. profiles: buyer occupation ─────────────────────────────────────────────
alter table profiles add column if not exists occupation text;

-- ── 2. plots: verification pipeline + area context (acres shown in app from sq.yds ÷ 4840) ──
alter table plots add column if not exists document_status text default 'pending';
alter table plots add column if not exists legal_verify_status text default 'pending';
alter table plots add column if not exists physical_verify_status text default 'pending';

comment on column plots.document_status is 'pending | in_review | verified | rejected | na';
comment on column plots.legal_verify_status is 'pending | in_review | verified | rejected | na';
comment on column plots.physical_verify_status is 'pending | in_review | verified | rejected | na';

-- ── 3. seller_properties: seller motivation (inventory / listing) ────────────
alter table seller_properties add column if not exists seller_interest text;
comment on column seller_properties.seller_interest is 'urgent_sale | ready_to_sale | interested | null';

-- ── 4. buyer_requests: residence vs preferred search, SDVF, ops comment ─────
alter table buyer_requests add column if not exists buyer_residence_city text;
alter table buyer_requests add column if not exists buyer_residence_state text;
alter table buyer_requests add column if not exists buyer_residence_notes text;
alter table buyer_requests add column if not exists ops_comment text;
alter table buyer_requests add column if not exists sdvf_status text default 'checking';
alter table buyer_requests add column if not exists sdvf_reason text;

comment on column buyer_requests.state is 'Preferred search: state';
comment on column buyer_requests.district is 'Preferred search: district';
comment on column buyer_requests.mandal is 'Preferred search: mandal';
comment on column buyer_requests.sdvf_status is 'checking | approved | rejected (internal SDVF review)';

update buyer_requests set sdvf_status = 'checking' where sdvf_status is null;

-- ── 5. appointments: assignment, related request, SLA anchor, extra statuses ──
alter table appointments add column if not exists assigned_to uuid references auth.users (id) on delete set null;
alter table appointments add column if not exists related_buyer_request_id uuid references buyer_requests (id) on delete set null;
alter table appointments add column if not exists sla_target_at timestamptz;

comment on column appointments.appointment_type is 'buyer | seller | service | lease';
comment on column appointments.sla_target_at is 'Optional ops target for first contact / callback';

-- ── 6. buyer_request_notes (comment / reason history) ────────────────────────
create table if not exists buyer_request_notes (
  id                 uuid default gen_random_uuid() primary key,
  buyer_request_id   uuid not null references buyer_requests (id) on delete cascade,
  author_user_id     uuid references auth.users (id) on delete set null,
  body               text not null,
  created_at         timestamptz default now()
);

create index if not exists idx_brn_request on buyer_request_notes (buyer_request_id);

alter table buyer_request_notes enable row level security;

create policy "Admin staff manage buyer_request_notes"
  on buyer_request_notes for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

-- ── 7. plots: allow admin/staff to manage inventory (was public read-only only) ─
drop policy if exists "Admin staff manage plots" on plots;
create policy "Admin staff manage plots"
  on plots for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

-- ── 8. profiles: admin/staff can update records (e.g. occupation) ────────────
drop policy if exists "Admin staff update profiles" on profiles;
create policy "Admin staff update profiles"
  on profiles for update
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

-- ── 9. Widen admin-only policies to include staff ────────────────────────────
drop policy if exists "Admin full access to appointments" on appointments;
create policy "Admin staff full access to appointments"
  on appointments for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

drop policy if exists "Admin full access to buyer_requests" on buyer_requests;
create policy "Admin staff full access to buyer_requests"
  on buyer_requests for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

drop policy if exists "Admin full access to seller_properties" on seller_properties;
create policy "Admin staff full access to seller_properties"
  on seller_properties for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

-- service_bookings / payment_orders (phase 3) — optional staff access
drop policy if exists "Admin full access on service_bookings" on service_bookings;
create policy "Admin staff full access on service_bookings"
  on service_bookings for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

drop policy if exists "Admin full access on payment_orders" on payment_orders;
create policy "Admin staff full access on payment_orders"
  on payment_orders for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));
