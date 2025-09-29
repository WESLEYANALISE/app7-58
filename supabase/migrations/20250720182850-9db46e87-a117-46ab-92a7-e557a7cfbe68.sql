
-- Criar tabela produtos para armazenar as imagens dos livros
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  produtos TEXT NOT NULL, -- URL da imagem do produto
  preco DECIMAL(10,2),
  descricao TEXT,
  categoria TEXT DEFAULT 'livros',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos vejam os produtos
CREATE POLICY "Todos podem ver produtos" 
  ON public.produtos 
  FOR SELECT 
  USING (true);

-- Política para admins gerenciarem produtos
CREATE POLICY "Admins podem gerenciar produtos" 
  ON public.produtos 
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Inserir alguns produtos de exemplo
INSERT INTO public.produtos (nome, produtos, preco, descricao, categoria) VALUES
('Código Civil Comentado', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', 89.90, 'Código Civil com comentários atualizados', 'livros'),
('Manual de Direito Penal', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop', 95.50, 'Manual completo de Direito Penal', 'livros'),
('Direito Constitucional', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', 78.90, 'Fundamentos do Direito Constitucional', 'livros'),
('Direito Administrativo', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop', 82.90, 'Princípios do Direito Administrativo', 'livros'),
('Direito Tributário', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=400&fit=crop', 91.50, 'Guia completo de Direito Tributário', 'livros'),
('Direito do Trabalho', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop', 85.90, 'Legislação trabalhista atualizada', 'livros'),
('Direito Processual Civil', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop', 93.90, 'Processo Civil moderno', 'livros'),
('Direito Empresarial', 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300&h=400&fit=crop', 88.90, 'Direito das empresas', 'livros');
