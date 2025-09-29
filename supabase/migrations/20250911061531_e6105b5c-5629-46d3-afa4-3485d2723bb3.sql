-- Criar tabela para listas de tarefas dos usuários
CREATE TABLE public.user_task_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para tarefas individuais
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.user_task_lists(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  concluida BOOLEAN NOT NULL DEFAULT false,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('alta', 'media', 'baixa')),
  data_vencimento DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.user_task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_task_lists
CREATE POLICY "Usuários podem ver suas próprias listas"
ON public.user_task_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias listas"
ON public.user_task_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias listas"
ON public.user_task_lists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias listas"
ON public.user_task_lists FOR DELETE
USING (auth.uid() = user_id);

-- Políticas RLS para user_tasks
CREATE POLICY "Usuários podem ver tarefas de suas listas"
ON public.user_tasks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_task_lists 
  WHERE id = user_tasks.list_id AND user_id = auth.uid()
));

CREATE POLICY "Usuários podem criar tarefas em suas listas"
ON public.user_tasks FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_task_lists 
  WHERE id = user_tasks.list_id AND user_id = auth.uid()
));

CREATE POLICY "Usuários podem atualizar tarefas de suas listas"
ON public.user_tasks FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.user_task_lists 
  WHERE id = user_tasks.list_id AND user_id = auth.uid()
));

CREATE POLICY "Usuários podem deletar tarefas de suas listas"
ON public.user_tasks FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.user_task_lists 
  WHERE id = user_tasks.list_id AND user_id = auth.uid()
));

-- Triggers para atualizar updated_at
CREATE TRIGGER update_user_task_lists_updated_at
  BEFORE UPDATE ON public.user_task_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON public.user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo para demonstração
INSERT INTO public.user_task_lists (id, user_id, nome, descricao) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '00000000-0000-0000-0000-000000000000', 'Preparação OAB', 'Cronograma de estudos para o exame da OAB'),
  ('550e8400-e29b-41d4-a716-446655440002', '00000000-0000-0000-0000-000000000000', 'Estudos Diários', 'Rotina diária de estudos jurídicos'),
  ('550e8400-e29b-41d4-a716-446655440003', '00000000-0000-0000-0000-000000000000', 'Leituras Essenciais', 'Lista de livros e artigos fundamentais');

INSERT INTO public.user_tasks (list_id, titulo, descricao, prioridade, concluida) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Revisar Direito Constitucional', 'Estudar princípios fundamentais e direitos', 'alta', false),
  ('550e8400-e29b-41d4-a716-446655440001', 'Fazer simulado de Direito Civil', 'Resolver questões de contratos e obrigações', 'alta', true),
  ('550e8400-e29b-41d4-a716-446655440001', 'Ler resumo de Processo Civil', 'Focar em procedimentos e recursos', 'media', false),
  ('550e8400-e29b-41d4-a716-446655440002', 'Leitura matinal - 30 min', 'Ler doutrina ou jurisprudência', 'media', true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Resolver 10 questões', 'Banco de questões do aplicativo', 'alta', false),
  ('550e8400-e29b-41d4-a716-446655440002', 'Revisar anotações', 'Organizar e revisar notas do dia', 'baixa', false),
  ('550e8400-e29b-41d4-a716-446655440003', 'Ler "Manual de Direito Civil"', 'Capítulos sobre responsabilidade civil', 'media', false),
  ('550e8400-e29b-41d4-a716-446655440003', 'Estudar jurisprudência STF', 'Casos recentes de direito constitucional', 'alta', false);