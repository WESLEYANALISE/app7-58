-- Tabela para armazenar conteúdo gerado das aulas
CREATE TABLE public.lesson_generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id BIGINT NOT NULL,
  lesson_area TEXT NOT NULL,
  lesson_tema TEXT NOT NULL,
  lesson_assunto TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('summary', 'flashcards', 'quiz')),
  content JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Índices para performance
CREATE INDEX idx_lesson_content_lesson_id ON public.lesson_generated_content(lesson_id);
CREATE INDEX idx_lesson_content_type ON public.lesson_generated_content(content_type);
CREATE INDEX idx_lesson_content_user ON public.lesson_generated_content(user_id);
CREATE INDEX idx_lesson_content_expires ON public.lesson_generated_content(expires_at);

-- RLS Policies
ALTER TABLE public.lesson_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lesson content" ON public.lesson_generated_content
  FOR SELECT USING (true);

CREATE POLICY "Users can create lesson content" ON public.lesson_generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Tabela para PDFs exportados das aulas
CREATE TABLE public.lesson_pdf_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id BIGINT NOT NULL,
  lesson_title TEXT NOT NULL,
  lesson_area TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('summary', 'flashcards', 'quiz', 'complete')),
  file_path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Índices
CREATE INDEX idx_lesson_pdf_lesson_id ON public.lesson_pdf_exports(lesson_id);
CREATE INDEX idx_lesson_pdf_user ON public.lesson_pdf_exports(user_id);
CREATE INDEX idx_lesson_pdf_expires ON public.lesson_pdf_exports(expires_at);

-- RLS Policies
ALTER TABLE public.lesson_pdf_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their PDF exports" ON public.lesson_pdf_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create PDF exports" ON public.lesson_pdf_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lesson_content_updated_at
  BEFORE UPDATE ON public.lesson_generated_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para limpeza automática de conteúdo expirado
CREATE OR REPLACE FUNCTION public.cleanup_expired_lesson_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar conteúdo de aula expirado
  DELETE FROM public.lesson_generated_content 
  WHERE expires_at < now();
  
  -- Deletar PDFs expirados
  DELETE FROM public.lesson_pdf_exports 
  WHERE expires_at < now();
END;
$$;