-- Phase 12 — Seed maintenance_mode feature flag
insert into feature_flags (key, enabled, description, sort_order) values
  ('maintenance_mode', false, 'Show maintenance screen to all non-admin visitors', 5)
on conflict (key) do nothing;
