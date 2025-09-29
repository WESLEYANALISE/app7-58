
-- Criar tabela para armazenar solicitações de suporte
CREATE TABLE public.suporte_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  imagem_url TEXT,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permitir inserção pública (sem autenticação) para suporte
ALTER TABLE public.suporte_requests ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública
CREATE POLICY "Allow public insert on suporte_requests" 
  ON public.suporte_requests 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- Política para permitir visualização apenas para administradores (futuro)
CREATE POLICY "Allow admin select on suporte_requests" 
  ON public.suporte_requests 
  FOR SELECT 
  TO authenticated 
  USING (false); -- Por enquanto nenhum usuário pode visualizar, apenas inserir
