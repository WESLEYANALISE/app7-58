-- CORREÇÃO DA MIGRAÇÃO ANTERIOR: Usar nomes de colunas corretos

-- Para decks customizados - usar 'created_by' em vez de 'user_id'
CREATE POLICY "Usuários podem ver seus próprios decks" ON public.custom_decks 
FOR ALL USING (auth.uid()::text = created_by);

CREATE POLICY "Usuários podem ver flashcards de seus decks" ON public.deck_flashcards 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.custom_decks 
    WHERE custom_decks.id = deck_flashcards.deck_id 
    AND custom_decks.created_by = auth.uid()::text
  )
);

-- Verificar se existem outras tabelas que falharam e criar políticas básicas
-- Para todas as tabelas que foram habilitadas mas não receberam políticas devido ao erro

-- Log da correção
INSERT INTO public.admin_logs (admin_id, action_type, details)
VALUES (
  auth.uid(),
  'security_fix_correction',
  jsonb_build_object(
    'issue', 'FIXED_COLUMN_NAME_ERROR',
    'action', 'corrected_custom_decks_policies',
    'column_used', 'created_by',
    'timestamp', now(),
    'status', 'corrected'
  )
) ON CONFLICT DO NOTHING;