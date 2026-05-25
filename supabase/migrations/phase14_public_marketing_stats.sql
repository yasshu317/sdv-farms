-- Public aggregate stats for homepage (bypasses RLS via SECURITY DEFINER).
-- Run in Supabase SQL Editor if migrations are applied manually.

create or replace function public.public_marketing_stats()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'available', (
      select count(*)::int from seller_properties where status = 'approved'
    ),
    'clear_documented', (
      select count(*)::int
      from seller_properties
      where status = 'approved' and coalesce(doc_verified, false) = true
    ),
    'sold', (
      select count(*)::int from seller_properties where status = 'sold'
    ),
    'members', (
      select count(*)::int from profiles
    ),
    'listing_partners', (
      select count(distinct seller_id)::int
      from seller_properties
      where status = 'approved'
    ),
    'enquiries', (
      select count(*)::int from enquiries
    )
  );
$$;

comment on function public.public_marketing_stats() is 'Homepage KPI strip: counts across seller_properties/profiles/enquiries without exposing rows.';

revoke all on function public.public_marketing_stats() from public;

grant execute on function public.public_marketing_stats()
  to anon, authenticated, service_role;
