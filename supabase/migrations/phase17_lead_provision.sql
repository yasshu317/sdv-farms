-- Phase 17: Lead provisioning — link listing_submissions to a seller account
-- Adds seller_id so admin can pick which seller owns the provisioned listing.

alter table public.listing_submissions
  add column if not exists seller_id uuid references auth.users on delete set null;

comment on column public.listing_submissions.seller_id is
  'Set by admin when provisioning a seller_property from this lead.';
