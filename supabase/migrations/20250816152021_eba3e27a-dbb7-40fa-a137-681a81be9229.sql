-- Criar tabela de notícias com áudio
CREATE TABLE IF NOT EXISTS "NOTICIAS-AUDIO" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  capa TEXT,
  conteudo TEXT,
  link_audio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE "NOTICIAS-AUDIO" ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Todos podem ver notícias de áudio" 
ON "NOTICIAS-AUDIO" 
FOR SELECT 
USING (true);

-- Política para admin inserir
CREATE POLICY "Admins podem inserir notícias de áudio" 
ON "NOTICIAS-AUDIO" 
FOR INSERT 
WITH CHECK (is_admin_user());

-- Política para admin atualizar
CREATE POLICY "Admins podem atualizar notícias de áudio" 
ON "NOTICIAS-AUDIO" 
FOR UPDATE 
USING (is_admin_user());

-- Política para admin deletar
CREATE POLICY "Admins podem deletar notícias de áudio" 
ON "NOTICIAS-AUDIO" 
FOR DELETE 
USING (is_admin_user());

-- Criar tabela para rastrear notícias lidas pelos usuários
CREATE TABLE IF NOT EXISTS user_news_read (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  news_id UUID REFERENCES "NOTICIAS-AUDIO"(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, news_id)
);

-- Habilitar RLS para user_news_read
ALTER TABLE user_news_read ENABLE ROW LEVEL SECURITY;

-- Política para usuários gerenciarem suas próprias leituras
CREATE POLICY "Usuários podem gerenciar suas próprias leituras" 
ON user_news_read 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Função para contar notícias não lidas
CREATE OR REPLACE FUNCTION get_unread_news_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM "NOTICIAS-AUDIO" n
    WHERE NOT EXISTS (
      SELECT 1 
      FROM user_news_read r 
      WHERE r.user_id = user_uuid 
      AND r.news_id = n.id
    )
  );
END;
$$;

-- Função para marcar notícia como lida
CREATE OR REPLACE FUNCTION mark_news_as_read(user_uuid UUID, news_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_news_read (user_id, news_id)
  VALUES (user_uuid, news_uuid)
  ON CONFLICT (user_id, news_id) DO NOTHING;
END;
$$;