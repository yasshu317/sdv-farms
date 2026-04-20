-- Allow buyers to update their own land requests while status is still "open"
-- (Run in Supabase SQL Editor if not using CLI migrations.)

DROP POLICY IF EXISTS "Buyers update own open requests" ON buyer_requests;

CREATE POLICY "Buyers update own open requests"
  ON buyer_requests FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id AND status = 'open')
  WITH CHECK (auth.uid() = buyer_id AND status = 'open');
