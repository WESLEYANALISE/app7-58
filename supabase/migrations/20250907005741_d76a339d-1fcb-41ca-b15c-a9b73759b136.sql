-- Criar tabelas para o sistema de Redação Perfeita

-- Tabela para histórico de análises de redação
CREATE TABLE public.redacao_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  tipo_redacao TEXT NOT NULL CHECK (tipo_redacao IN ('dissertativa', 'parecer', 'peca')),
  texto_original TEXT NOT NULL,
  analise JSONB NOT NULL,
  arquivo_url TEXT,
  nome_arquivo TEXT,
  pontos_fortes TEXT[],
  pontos_melhoria TEXT[],
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para arquivos enviados para análise
CREATE TABLE public.redacao_arquivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  texto_extraido TEXT,
  tamanho_arquivo BIGINT,
  status_processamento TEXT DEFAULT 'pendente' CHECK (status_processamento IN ('pendente', 'processando', 'concluido', 'erro')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redacao_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redacao_arquivos ENABLE ROW LEVEL SECURITY;

-- RLS Policies para redacao_historico
CREATE POLICY "Users can view their own redacao history" 
ON public.redacao_historico 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redacao history" 
ON public.redacao_historico 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redacao history" 
ON public.redacao_historico 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own redacao history" 
ON public.redacao_historico 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies para redacao_arquivos
CREATE POLICY "Users can view their own redacao files" 
ON public.redacao_arquivos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redacao files" 
ON public.redacao_arquivos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redacao files" 
ON public.redacao_arquivos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own redacao files" 
ON public.redacao_arquivos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_redacao_historico_updated_at
BEFORE UPDATE ON public.redacao_historico
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redacao_arquivos_updated_at
BEFORE UPDATE ON public.redacao_arquivos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para arquivos de redação
INSERT INTO storage.buckets (id, name, public) 
VALUES ('redacao-arquivos', 'redacao-arquivos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies para redacao-arquivos
CREATE POLICY "Users can upload their own redacao files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'redacao-arquivos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own redacao files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'redacao-arquivos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own redacao files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'redacao-arquivos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own redacao files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'redacao-arquivos' AND auth.uid()::text = (storage.foldername(name))[1]);