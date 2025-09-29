-- Criar tabela para armazenar flashcards gerados do Vade Mecum
CREATE TABLE IF NOT EXISTS vade_mecum_flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_number TEXT NOT NULL,
  code_name TEXT NOT NULL,
  article_content TEXT NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  dica TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para armazenar questões geradas do Vade Mecum
CREATE TABLE IF NOT EXISTS vade_mecum_questoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_number TEXT NOT NULL,
  code_name TEXT NOT NULL,
  article_content TEXT NOT NULL,
  questao TEXT NOT NULL,
  alternativa_a TEXT NOT NULL,
  alternativa_b TEXT NOT NULL,
  alternativa_c TEXT NOT NULL,
  alternativa_d TEXT NOT NULL,
  resposta_correta TEXT NOT NULL,
  explicacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE vade_mecum_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vade_mecum_questoes ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para flashcards
CREATE POLICY "Users can view their own Vade Mecum flashcards"
ON vade_mecum_flashcards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Vade Mecum flashcards"
ON vade_mecum_flashcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Vade Mecum flashcards"
ON vade_mecum_flashcards FOR DELETE
USING (auth.uid() = user_id);

-- Criar políticas RLS para questões
CREATE POLICY "Users can view their own Vade Mecum questões"
ON vade_mecum_questoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Vade Mecum questões"
ON vade_mecum_questoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Vade Mecum questões"
ON vade_mecum_questoes FOR DELETE
USING (auth.uid() = user_id);