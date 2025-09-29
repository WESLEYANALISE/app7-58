-- Add image_url column to legal_news_cache if it doesn't exist
ALTER TABLE public.legal_news_cache 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ensure expires_at has a proper default if it doesn't already
ALTER TABLE public.legal_news_cache 
ALTER COLUMN expires_at SET DEFAULT (now() + interval '2 hours');