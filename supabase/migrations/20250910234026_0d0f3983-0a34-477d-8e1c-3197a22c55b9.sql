-- Create table for legal news cache
CREATE TABLE public.legal_news_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal text NOT NULL,
  title text NOT NULL,
  preview text,
  full_content text,
  image_url text,
  news_url text NOT NULL,
  published_at timestamp with time zone,
  cached_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_news_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (news are public)
CREATE POLICY "Legal news are publicly accessible" 
ON public.legal_news_cache 
FOR SELECT 
USING (true);

-- Create policy to prevent direct inserts (only edge functions should insert)
CREATE POLICY "Only service role can insert legal news" 
ON public.legal_news_cache 
FOR INSERT 
WITH CHECK (false);

-- Create index for faster queries
CREATE INDEX idx_legal_news_portal ON public.legal_news_cache(portal);
CREATE INDEX idx_legal_news_expires ON public.legal_news_cache(expires_at);
CREATE INDEX idx_legal_news_published ON public.legal_news_cache(published_at DESC);

-- Create function to cleanup expired news
CREATE OR REPLACE FUNCTION public.cleanup_expired_legal_news()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.legal_news_cache 
  WHERE expires_at < now();
END;
$$;