-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('brand-logos', 'brand-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('site-assets', 'site-assets', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

-- RLS policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- RLS policies for brand-logos bucket
CREATE POLICY "Anyone can view brand logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'brand-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update brand logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'brand-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete brand logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'brand-logos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- RLS policies for site-assets bucket
CREATE POLICY "Anyone can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Update existing notifications to use new type values
UPDATE notifications SET type = 'bilgi' WHERE type = 'info';
UPDATE notifications SET type = 'bilgi' WHERE type NOT IN ('kampanya', 'bilgi', 'önemli');

-- Update notifications table to use specific types
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ALTER COLUMN type SET DEFAULT 'bilgi';

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('kampanya', 'bilgi', 'önemli'));

-- Add last_active_at to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone DEFAULT now();