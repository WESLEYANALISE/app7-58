-- Create conversation exports table for temporary PDF storage
CREATE TABLE public.conversation_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  conversation_data JSONB NOT NULL,
  pdf_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_exports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own exports" 
ON public.conversation_exports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own exports" 
ON public.conversation_exports 
FOR SELECT 
USING (auth.uid() = user_id OR (user_id IS NULL AND user_ip = auth.jwt()->>'user_ip'));

CREATE POLICY "Users can delete their own exports" 
ON public.conversation_exports 
FOR DELETE 
USING (auth.uid() = user_id OR (user_id IS NULL AND user_ip = auth.jwt()->>'user_ip'));

-- Create storage bucket for temporary PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('conversation-pdfs', 'conversation-pdfs', true);

-- Create policies for conversation PDFs
CREATE POLICY "Anyone can upload conversation PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'conversation-pdfs');

CREATE POLICY "Conversation PDFs are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'conversation-pdfs');

CREATE POLICY "Anyone can delete conversation PDFs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'conversation-pdfs');

-- Create function to cleanup expired PDFs
CREATE OR REPLACE FUNCTION public.cleanup_expired_conversation_exports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired records from database
  DELETE FROM public.conversation_exports 
  WHERE expires_at < now();
  
  -- Note: Storage cleanup should be handled by a separate cron job
END;
$$;