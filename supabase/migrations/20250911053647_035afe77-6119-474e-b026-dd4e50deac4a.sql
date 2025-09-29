-- Create storage bucket for notes files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notes-files', 'notes-files', false);

-- Create table for note files metadata
CREATE TABLE public.note_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for note_files
ALTER TABLE public.note_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their note files"
  ON public.note_files FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their note files"
  ON public.note_files FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their note files"
  ON public.note_files FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their note files"
  ON public.note_files FOR DELETE
  USING (true);

-- Create storage policies
CREATE POLICY "Users can upload note files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'notes-files');

CREATE POLICY "Users can view note files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notes-files');

CREATE POLICY "Users can update note files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'notes-files');

CREATE POLICY "Users can delete note files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'notes-files');

-- Create trigger for updated_at
CREATE TRIGGER update_note_files_updated_at
  BEFORE UPDATE ON public.note_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();