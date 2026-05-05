-- Phase 9 — Feature flags / remote config (Flagsmith-style): keyed rows + JSON payload

create table if not exists feature_flags (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  enabled      boolean not null default false,
  payload      jsonb not null default '{}',
  description  text,
  sort_order   int not null default 0,
  metadata     jsonb not null default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

comment on table feature_flags is 'Remote flags and config; payload/metadata are arbitrary JSON — do not store secrets.';
comment on column feature_flags.key is 'Stable slug: lowercase letters, digits, underscores (e.g. new_checkout_ui).';
comment on column feature_flags.payload is 'App-facing JSON (variants, percentages, strings, etc.).';
comment on column feature_flags.metadata is 'Internal notes / future fields without migrating.';

create index if not exists idx_feature_flags_sort on feature_flags (sort_order, key);

create trigger feature_flags_updated_at
  before update on feature_flags
  for each row execute function update_updated_at();

alter table feature_flags enable row level security;

-- Public read: safe for rollout flags (never put secrets in payload)
drop policy if exists "Public read feature_flags" on feature_flags;
create policy "Public read feature_flags"
  on feature_flags for select
  using (true);

drop policy if exists "Admin staff manage feature_flags" on feature_flags;
create policy "Admin staff manage feature_flags"
  on feature_flags for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));

insert into feature_flags (key, enabled, payload, description, sort_order) values
  ('home_stats_bar', true, '{"source": "dynamic"}'::jsonb, 'Homepage stats ribbon (wired in app)', 10),
  ('buyer_land_request_beta', false, '{}'::jsonb, 'Placeholder: gate experimental buyer-request UI', 20)
on conflict (key) do nothing;
