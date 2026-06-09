-- Phase 16: Public listing submission form
-- Allows unauthenticated users to submit land listing requests.
-- Admin reviews these as leads and can convert them into seller_properties.

create table public.listing_submissions (
  id                    uuid primary key default gen_random_uuid(),

  -- Contact info (person submitting — may differ from farmer on the document)
  submitter_first_name  text not null,
  submitter_last_name   text not null,
  submitter_mobile      text not null,
  submitter_email       text,

  -- Land location
  state                 text not null,
  district              text not null,
  mandal                text not null,
  village               text not null,
  location_notes        text,   -- optional: Google Maps link, survey no., landmark

  -- Farmer / document details
  farmer_name           text not null,   -- name exactly as on land document
  farmer_phone          text,

  -- Land characteristics
  land_used_type        text,
  land_soil_type        text,
  area_acres            numeric,
  expected_price        numeric,         -- per acre in INR
  seller_interest       text,
  road_access           boolean not null default false,

  -- Uploaded files (Supabase Storage public URLs)
  doc_urls              text[] not null default '{}',
  photo_urls            text[] not null default '{}',

  -- Admin workflow
  status                text not null default 'new',
  -- values: 'new' | 'contacted' | 'converted' | 'rejected'
  admin_notes           text,
  converted_listing_id  uuid references public.seller_properties(id) on delete set null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- RLS -----------------------------------------------------------------------
alter table public.listing_submissions enable row level security;

-- Anyone (including anon) can insert a new submission
create policy "listing_submissions_public_insert"
  on public.listing_submissions
  for insert
  to anon, authenticated
  with check (true);

-- Only admin / staff can read, update, delete
create policy "listing_submissions_admin_all"
  on public.listing_submissions
  for all
  to authenticated
  using (
    coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      (auth.jwt() ->> 'role')
    ) in ('admin', 'staff')
  );

-- Trigger: keep updated_at current --------------------------------------------
-- (reuse or create the helper function if it doesn't exist yet)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger listing_submissions_updated_at
  before update on public.listing_submissions
  for each row execute procedure public.set_updated_at();
