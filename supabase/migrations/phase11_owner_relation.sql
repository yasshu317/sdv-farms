-- Phase 11 — Seller property: owner relation to farmer

alter table seller_properties
  add column if not exists owner_relation text
    check (owner_relation in ('Self','Wife','Daughter','Son','Mother','Father','G.Mother','G.Father'));

comment on column seller_properties.owner_relation is 'Submitting seller''s relation to the land owner (Self, Wife, Son, etc.)';
