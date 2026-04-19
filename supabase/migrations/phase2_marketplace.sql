-- ============================================================
-- SDV Farms Phase 2 — Marketplace Tables
-- Run this in: Supabase → SQL Editor
-- ============================================================

-- ── Shared trigger function for updated_at ──────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ── 1. seller_properties ────────────────────────────────────
create table if not exists seller_properties (
  -- Identity
  id              uuid default gen_random_uuid() primary key,
  seller_id       uuid references auth.users not null,
  property_id     text unique,                        -- SDV-2025-001 assigned by admin on approve

  -- Location
  state           text,
  district        text,
  mandal          text,
  village         text,
  zip_code        text,
  farmer_name     text,
  latitude        numeric,                            -- future: map view
  longitude       numeric,                            -- future: map view

  -- Land details
  listing_type    text default 'sale',                -- future: 'lease'
  land_used_type  text,                               -- Agriculture / Estate Agriculture / Industrial / Commercial / Residential
  land_soil_type  text,                               -- Black / Red / Sandy
  land_doc_type   text,                               -- Adangal / Pahani(ROR-1B) / RTC / Patta
  road_access     boolean default false,
  area_acres      numeric,
  expected_price  numeric,                            -- price per acre

  -- Media
  doc_urls        text[] default '{}',
  photo_urls      text[] default '{}',

  -- Verification (future)
  doc_verified    boolean default false,

  -- Status & metrics
  status          text default 'pending',             -- pending / approved / rejected / sold
  views           int default 0,

  -- Future: e-sign
  agreement_url   text,
  signed_at       timestamptz,

  -- Extensibility — add future fields here without migrations
  metadata        jsonb default '{}',

  -- Audit
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_sp_status       on seller_properties(status);
create index if not exists idx_sp_seller_id    on seller_properties(seller_id);
create index if not exists idx_sp_state        on seller_properties(state);
create index if not exists idx_sp_soil_type    on seller_properties(land_soil_type);
create index if not exists idx_sp_listing_type on seller_properties(listing_type);

create trigger seller_properties_updated_at
  before update on seller_properties
  for each row execute function update_updated_at();

alter table seller_properties enable row level security;

create policy "Sellers manage own listings"
  on seller_properties for all
  using (auth.uid() = seller_id);

create policy "Public can view approved listings"
  on seller_properties for select
  using (status = 'approved');

create policy "Admin full access to seller_properties"
  on seller_properties for all
  using ((auth.jwt()->'user_metadata'->>'role') = 'admin');


-- ── 2. appointments ─────────────────────────────────────────
create table if not exists appointments (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users not null,
  property_id       uuid references seller_properties,
  appointment_date  date not null,
  time_slot         text not null,                    -- "9AM-10AM" … "5PM-6PM"
  appointment_type  text,                             -- buyer / seller / service
  status            text default 'pending',           -- pending / confirmed / cancelled

  -- Future: payment gateway
  payment_status    text default 'not_required',      -- not_required / pending / paid
  advance_amount    numeric,

  -- Future: e-sign
  agreement_url     text,
  signed_at         timestamptz,

  notes             text,
  metadata          jsonb default '{}',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_apt_user_id on appointments(user_id);
create index if not exists idx_apt_date    on appointments(appointment_date);
create index if not exists idx_apt_status  on appointments(status);

create trigger appointments_updated_at
  before update on appointments
  for each row execute function update_updated_at();

alter table appointments enable row level security;

create policy "Users manage own appointments"
  on appointments for all
  using (auth.uid() = user_id);

create policy "Admin full access to appointments"
  on appointments for all
  using ((auth.jwt()->'user_metadata'->>'role') = 'admin');


-- ── 3. buyer_wishlist ────────────────────────────────────────
create table if not exists buyer_wishlist (
  id          uuid default gen_random_uuid() primary key,
  buyer_id    uuid references auth.users not null,
  property_id uuid references seller_properties not null,
  created_at  timestamptz default now(),
  unique(buyer_id, property_id)
);

create index if not exists idx_wl_buyer_id on buyer_wishlist(buyer_id);

alter table buyer_wishlist enable row level security;

create policy "Buyers manage own wishlist"
  on buyer_wishlist for all
  using (auth.uid() = buyer_id);


-- ── 4. buyer_requests ───────────────────────────────────────
create table if not exists buyer_requests (
  id             uuid default gen_random_uuid() primary key,
  buyer_id       uuid references auth.users,          -- null = anonymous request
  name           text,
  phone          text,
  email          text,
  state          text,
  district       text,
  mandal         text,
  land_soil_type text,
  area_min       numeric,
  area_max       numeric,
  price_max      numeric,
  listing_type   text default 'sale',                 -- future: sale / lease
  notes          text,
  status         text default 'open',                 -- open / matched / closed
  metadata       jsonb default '{}',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists idx_br_status on buyer_requests(status);

create trigger buyer_requests_updated_at
  before update on buyer_requests
  for each row execute function update_updated_at();

alter table buyer_requests enable row level security;

create policy "Anyone can submit a request"
  on buyer_requests for insert
  with check (true);

create policy "Buyers see own requests"
  on buyer_requests for select
  using (auth.uid() = buyer_id);

create policy "Admin full access to buyer_requests"
  on buyer_requests for all
  using ((auth.jwt()->'user_metadata'->>'role') = 'admin');


-- ============================================================
-- Storage buckets — run separately in Storage dashboard or:
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('property-docs',    'property-docs',    true);
-- insert into storage.buckets (id, name, public) values ('property-photos',  'property-photos',  true);
--
-- Storage RLS (after creating buckets):
-- create policy "Auth users can upload docs"
--   on storage.objects for insert
--   with check (bucket_id = 'property-docs' and auth.role() = 'authenticated');
-- create policy "Public can read docs"
--   on storage.objects for select
--   using (bucket_id = 'property-docs');
-- create policy "Auth users can upload photos"
--   on storage.objects for insert
--   with check (bucket_id = 'property-photos' and auth.role() = 'authenticated');
-- create policy "Public can read photos"
--   on storage.objects for select
--   using (bucket_id = 'property-photos');
