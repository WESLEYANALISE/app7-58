-- Criar apenas as tabelas básicas primeiro
CREATE TABLE IF NOT EXISTS public.redacao_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  tipo_arquivo TEXT NOT NULL,
  url_arquivo TEXT NOT NULL,
  tamanho_arquivo BIGINT NOT NULL,
  texto_extraido TEXT,
  status_processamento TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.redacao_analises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo_redacao TEXT NOT NULL,
  texto_original TEXT NOT NULL,
  analise JSONB NOT NULL,
  analise_tecnica JSONB,
  nota DECIMAL(3,1),
  arquivo_id UUID REFERENCES redacao_arquivos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.redacao_arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redacao_analises ENABLE ROW LEVEL SECURITY;