-- Allow sellers (listing owners) to read appointment rows tied to their seller_properties IDs.
-- Needed for enquiry / visit-request counts on the seller dashboard. Writers remain appointment owner + admin policies.

drop policy if exists "Sellers select appointments on own listings" on appointments;

create policy "Sellers select appointments on own listings"
  on appointments for select
  using (
    exists (
      select 1
      from seller_properties sp
      where sp.id = appointments.property_id
        and sp.seller_id = auth.uid()
    )
  );
