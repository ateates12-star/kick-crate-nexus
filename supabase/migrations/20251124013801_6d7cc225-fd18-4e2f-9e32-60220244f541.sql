-- Add address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address_title TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;