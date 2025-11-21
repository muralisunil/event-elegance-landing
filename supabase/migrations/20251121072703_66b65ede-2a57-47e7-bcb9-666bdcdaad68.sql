-- Add custom_layout_data column to venue_halls for storing Fabric.js layouts
ALTER TABLE public.venue_halls 
ADD COLUMN IF NOT EXISTS custom_layout_data TEXT;