-- Phase 10 — Business feedback: businesses can submit feedback; admin reviews/responds

create table if not exists business_feedback (
  id             uuid primary key default gen_random_uuid(),
  business_name  text not null,
  contact_name   text,
  email          text,
  phone          text,
  feedback_type  text not null default 'general'
                   check (feedback_type in ('general', 'suggestion', 'complaint', 'partnership', 'other')),
  message        text not null,
  rating         smallint check (rating between 1 and 5),
  status         text not null default 'new'
                   check (status in ('new', 'read', 'replied', 'archived')),
  admin_notes    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

comment on table  business_feedback is 'Feedback submitted by businesses; reviewed by admin/staff.';
comment on column business_feedback.feedback_type is 'general | suggestion | complaint | partnership | other';
comment on column business_feedback.rating         is '1–5 star rating, optional.';
comment on column business_feedback.status         is 'new → read → replied → archived';
comment on column business_feedback.admin_notes    is 'Internal notes added by admin/staff, not visible to submitter.';

create index if not exists idx_business_feedback_status     on business_feedback (status);
create index if not exists idx_business_feedback_created_at on business_feedback (created_at desc);

create trigger business_feedback_updated_at
  before update on business_feedback
  for each row execute function update_updated_at();

alter table business_feedback enable row level security;

-- Anyone can insert (businesses submit without an account)
drop policy if exists "Public insert business_feedback" on business_feedback;
create policy "Public insert business_feedback"
  on business_feedback for insert
  with check (true);

-- Only admin/staff can read, update, delete
drop policy if exists "Admin staff manage business_feedback" on business_feedback;
create policy "Admin staff manage business_feedback"
  on business_feedback for all
  using ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'))
  with check ((auth.jwt()->'user_metadata'->>'role') in ('admin', 'staff'));
