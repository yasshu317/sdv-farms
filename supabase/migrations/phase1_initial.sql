-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 1 Migration: Core tables, RLS policies, admin roles, seed plots
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Tables ─────────────────────────────────────────────────────────────────
create table profiles (
  id         uuid references auth.users primary key,
  full_name  text,
  email      text,
  phone      text,
  created_at timestamptz default now()
);

create table enquiries (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users,
  name       text,
  email      text,
  phone      text,
  message    text,
  status     text default 'pending',
  created_at timestamptz default now()
);

create table plots (
  id              uuid default gen_random_uuid() primary key,
  plot_number     int,
  area_sqyds      numeric,
  price_per_sqyd  numeric,
  status          text default 'available',
  created_at      timestamptz default now()
);

create table plot_interests (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users,
  plot_id    uuid references plots,
  status     text default 'pending',
  created_at timestamptz default now()
);

-- ── 2. Row Level Security ─────────────────────────────────────────────────────
alter table enquiries     enable row level security;
alter table profiles      enable row level security;
alter table plot_interests enable row level security;
alter table plots         enable row level security;

create policy "Users see own enquiries"  on enquiries     for all    using (auth.uid() = user_id);
create policy "Users see own interests"  on plot_interests for all   using (auth.uid() = user_id);
create policy "Anyone can read plots"    on plots         for select using (true);
create policy "Anyone can read profiles" on profiles      for select using (true);
create policy "Users manage own profile" on profiles      for all    using (auth.uid() = id);

-- ── 3. Admin roles ────────────────────────────────────────────────────────────
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'rowchow@gmail.com';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'yaswanth4urs@gmail.com';

-- ── 4. Seed plots ─────────────────────────────────────────────────────────────
insert into plots (plot_number, area_sqyds, price_per_sqyd, status) values
(1, 150, 4500, 'available'),
(2, 200, 4500, 'available'),
(3, 150, 4500, 'reserved'),
(4, 250, 4200, 'available'),
(5, 180, 4500, 'sold');
