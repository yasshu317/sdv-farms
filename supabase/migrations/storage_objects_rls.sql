-- =============================================================================
-- Supabase Storage: buckets + RLS for property-docs & property-photos
-- =============================================================================
-- Apply in Supabase Dashboard → SQL Editor (or: supabase db push / migration).
-- Fixes: 403 "new row violates row-level security policy" on uploads.
--
-- Requires: nothing (idempotent DROP IF EXISTS + INSERT ON CONFLICT).
-- =============================================================================

-- Buckets (public URLs for getPublicUrl; RLS still applies to API operations)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-docs', 'property-docs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Remove previous SDV policies if re-running
DROP POLICY IF EXISTS "sdv_property_docs_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "sdv_property_docs_select_public" ON storage.objects;
DROP POLICY IF EXISTS "sdv_property_docs_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "sdv_property_photos_insert_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "sdv_property_photos_select_public" ON storage.objects;
DROP POLICY IF EXISTS "sdv_property_photos_update_authenticated" ON storage.objects;

-- Authenticated uploads
CREATE POLICY "sdv_property_docs_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-docs');

CREATE POLICY "sdv_property_photos_insert_authenticated"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

-- Upsert / replace uses UPDATE on the object row
CREATE POLICY "sdv_property_docs_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-docs')
  WITH CHECK (bucket_id = 'property-docs');

CREATE POLICY "sdv_property_photos_update_authenticated"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'property-photos')
  WITH CHECK (bucket_id = 'property-photos');

-- Public read (bucket is public; needed for listing / signed-style access patterns)
CREATE POLICY "sdv_property_docs_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'property-docs');

CREATE POLICY "sdv_property_photos_select_public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'property-photos');
