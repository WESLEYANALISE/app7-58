-- Verificar se RLS está habilitado na tabela NOTICIAS-AUDIO
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'NOTICIAS-AUDIO';

-- Ativar RLS na tabela NOTICIAS-AUDIO se não estiver ativado
ALTER TABLE public."NOTICIAS-AUDIO" ENABLE ROW LEVEL SECURITY;

-- Habilitar realtime para a tabela NOTICIAS-AUDIO
ALTER TABLE public."NOTICIAS-AUDIO" REPLICA IDENTITY FULL;

-- Adicionar a tabela na publicação do realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public."NOTICIAS-AUDIO";

-- Inserir uma notícia de teste para verificar se funciona
INSERT INTO public."NOTICIAS-AUDIO" (titulo, capa, conteudo) 
VALUES (
  'Nova Lei Aprovada no Congresso', 
  'https://via.placeholder.com/150x150/amber/white?text=Lei',
  'Conteúdo da notícia sobre a nova lei aprovada...'
);