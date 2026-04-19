# Skill: Add a New Supabase Table to SDV Farms

Use this skill whenever you need to add a new database table.

## SQL Template

```sql
-- 1. Create the table
create table if not exists your_table_name (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users,   -- if user-owned

  -- Your columns here
  name        text,
  status      text default 'pending',       -- always add a status

  -- Future-proofing (ALWAYS include these two)
  metadata    jsonb default '{}',           -- add future fields without migrations
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()     -- kept fresh by trigger below
);

-- 2. Indexes (add for every column used in WHERE or ORDER BY)
create index if not exists idx_yt_user_id on your_table_name(user_id);
create index if not exists idx_yt_status  on your_table_name(status);

-- 3. updated_at trigger
create trigger your_table_name_updated_at
  before update on your_table_name
  for each row execute function update_updated_at();

-- 4. Row Level Security
alter table your_table_name enable row level security;

create policy "Users manage own rows"
  on your_table_name for all
  using (auth.uid() = user_id);

create policy "Admin full access"
  on your_table_name for all
  using ((auth.jwt()->'user_metadata'->>'role') = 'admin');

-- Optional: public read
-- create policy "Public can read"
--   on your_table_name for select
--   using (status = 'approved');
```

## Rules
- ALWAYS add `metadata jsonb default '{}'` — never block future changes
- ALWAYS add `updated_at` + trigger for audit trails
- ALWAYS add RLS — never leave a table unprotected
- Add the migration SQL to `supabase/migrations/` with a descriptive filename
- Update `AGENTS.md` → Supabase Tables section with the new table
