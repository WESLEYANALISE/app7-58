-- Criar políticas RLS para as tabelas de redação
CREATE POLICY "Usuários podem ver seus próprios arquivos de redação" 
ON public.redacao_arquivos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios arquivos de redação" 
ON public.redacao_arquivos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios arquivos de redação" 
ON public.redacao_arquivos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios arquivos de redação" 
ON public.redacao_arquivos FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para redacao_analises
CREATE POLICY "Usuários podem ver suas próprias análises de redação" 
ON public.redacao_analises FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias análises de redação" 
ON public.redacao_analises FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias análises de redação" 
ON public.redacao_analises FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias análises de redação" 
ON public.redacao_analises FOR DELETE 
USING (auth.uid() = user_id);