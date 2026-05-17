-- Phase 13 — Testimonials & wins

create table if not exists testimonials (
  id          uuid primary key default gen_random_uuid(),
  type        text not null default 'testimonial'
                check (type in ('testimonial', 'win')),
  name        text not null,
  role        text,
  location    text,
  message     text not null,
  rating      int  check (rating between 1 and 5),
  avatar_url  text,
  win_icon    text,        -- emoji for win cards e.g. '🏆'
  win_stat    text,        -- short stat line e.g. '₹45L invested'
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'archived')),
  sort_order  int  not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_testimonials_status_sort on testimonials (status, sort_order);

create trigger testimonials_updated_at
  before update on testimonials
  for each row execute function update_updated_at();

alter table testimonials enable row level security;

-- Public can read approved
drop policy if exists "Public read testimonials" on testimonials;
create policy "Public read testimonials"
  on testimonials for select
  using (status = 'approved');

-- Admin/staff full access
drop policy if exists "Admin staff manage testimonials" on testimonials;
create policy "Admin staff manage testimonials"
  on testimonials for all
  using  ((auth.jwt()->'user_metadata'->>'role') in ('admin','staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin','staff'));

-- Seed samples
insert into testimonials (type, name, role, location, message, rating, status, sort_order) values
  ('testimonial', 'Ramesh K.',    'Agricultural investor',  'Bengaluru',  'I had been looking for verified farmland for two years. SDV Farms made the process transparent and smooth — title deed in my name within a month.',    5, 'approved', 10),
  ('testimonial', 'Srilatha D.',  'Retired teacher',        'Hyderabad',  'The team was incredibly helpful. They arranged multiple site visits and answered every question patiently. Very trustworthy platform.',                   5, 'approved', 20),
  ('testimonial', 'Venu Gopal M.','Software engineer',      'Pune',       'Invested in 2 acres as a long-term asset. The land is exactly as described — government approved, water source nearby, good road access.',                  4, 'approved', 30),
  ('win',         'SDV Farms',    null,                     null,         '3 plots registered this quarter', null, 'approved', 40),
  ('win',         'SDV Farms',    null,                     null,         '₹1.2Cr in land investments facilitated', null, 'approved', 50),
  ('win',         'SDV Farms',    null,                     null,         'Buyers from 6 states served', null, 'approved', 60)
on conflict do nothing;
