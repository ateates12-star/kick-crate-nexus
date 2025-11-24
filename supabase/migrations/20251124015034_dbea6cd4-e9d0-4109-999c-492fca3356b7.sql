-- Create brand-logos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public access to brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete brand logos" ON storage.objects;

-- Enable public access to brand logos
CREATE POLICY "Public access to brand logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

-- Admins can upload brand logos
CREATE POLICY "Admins can upload brand logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update brand logos
CREATE POLICY "Admins can update brand logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brand-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can delete brand logos
CREATE POLICY "Admins can delete brand logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);