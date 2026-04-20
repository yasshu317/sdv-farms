-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 3 Migration: Service Bookings + Razorpay Orders
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Service bookings (Phase II post-purchase services) ─────────────────────
create table if not exists service_bookings (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users,          -- optional (anonymous allowed)

  -- Contact
  full_name     text not null,
  email         text not null,
  phone         text not null,

  -- Service details
  service_type  text not null,                        -- fencing | borewell | drip | farming_plan | plants
  property_location text,                             -- free text: village/mandal/district
  area_acres    numeric(8,2),
  notes         text,

  -- Status lifecycle
  status        text default 'pending',               -- pending | contacted | in_progress | completed | cancelled

  -- Future-proofing
  metadata      jsonb default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_sb_status    on service_bookings(status);
create index if not exists idx_sb_email     on service_bookings(email);
create index if not exists idx_sb_service   on service_bookings(service_type);

create trigger service_bookings_updated_at
  before update on service_bookings
  for each row execute function update_updated_at();

alter table service_bookings enable row level security;

-- Anyone can submit a service booking (anon or logged-in)
create policy "Public can insert service bookings"
  on service_bookings for insert
  with check (true);

-- Logged-in users can see their own bookings
create policy "Users see own bookings"
  on service_bookings for select
  using (auth.uid() = user_id or user_id is null);

-- Admins have full access
create policy "Admin full access on service_bookings"
  on service_bookings for all
  using ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- ── 2. Razorpay payment orders (test mode) ────────────────────────────────────
create table if not exists payment_orders (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users,
  appointment_id    uuid references appointments(id),

  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  amount_paise      integer not null,                 -- amount in paise (₹500 = 50000)
  currency          text default 'INR',
  status            text default 'created',           -- created | paid | failed | refunded

  metadata          jsonb default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_po_appointment on payment_orders(appointment_id);
create index if not exists idx_po_status      on payment_orders(status);
create index if not exists idx_po_rzp_order   on payment_orders(razorpay_order_id);

create trigger payment_orders_updated_at
  before update on payment_orders
  for each row execute function update_updated_at();

alter table payment_orders enable row level security;

create policy "Users manage own payment orders"
  on payment_orders for all
  using (auth.uid() = user_id);

create policy "Admin full access on payment_orders"
  on payment_orders for all
  using ((auth.jwt()->'user_metadata'->>'role') = 'admin');
