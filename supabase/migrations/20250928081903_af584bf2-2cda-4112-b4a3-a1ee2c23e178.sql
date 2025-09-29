-- CORREÇÃO CRÍTICA DE SEGURANÇA: Habilitar RLS em tabelas que possuem políticas mas não têm RLS ativo

-- 1. Primeiro, vamos corrigir o problema de recursão infinita na tabela admin_users
-- removendo as políticas problemáticas e criando uma função security definer

-- Remover políticas problemáticas da tabela admin_users
DROP POLICY IF EXISTS "Admin users can view other admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admins to view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin users" ON public.admin_users;

-- Criar função security definer para verificar se usuário é admin (evita recursão)
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE id = user_uuid
  );
$$;

-- Recriar políticas usando a função security definer
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin users" 
ON public.admin_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_super_admin = true
  )
);

-- 2. Habilitar RLS nas tabelas que possuem políticas mas não têm RLS ativo

-- Códigos jurídicos
ALTER TABLE public.codigo_civil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_defesa_consumidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_penal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_processo_penal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codigo_tributario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consolidacao_leis_trabalho ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituicao_federal ENABLE ROW LEVEL SECURITY;

-- Flashcards de direito
ALTER TABLE public.direito_administrativo_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direito_ambiental_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direito_civil_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direito_do_trabalho_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direito_penal_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direito_processual_civil_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direito_tributario_flashcards ENABLE ROW LEVEL SECURITY;

-- Outras tabelas
ALTER TABLE public.legal_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;

-- 3. Comentário sobre a correção
COMMENT ON FUNCTION public.is_user_admin(uuid) IS 'Security definer function to check admin status without RLS recursion';

-- Log da correção de segurança
INSERT INTO public.admin_logs (admin_id, action_type, details)
VALUES (
  auth.uid(),
  'security_fix',
  jsonb_build_object(
    'issue', 'RLS_POLICIES_WITHOUT_RLS_ENABLED',
    'tables_fixed', ARRAY[
      'codigo_civil', 'codigo_defesa_consumidor', 'codigo_penal', 
      'codigo_processo_penal', 'codigo_transito', 'codigo_tributario',
      'consolidacao_leis_trabalho', 'constituicao_federal',
      'direito_administrativo_flashcards', 'direito_ambiental_flashcards',
      'direito_civil_flashcards', 'direito_do_trabalho_flashcards',
      'direito_penal_flashcards', 'direito_processual_civil_flashcards',
      'direito_tributario_flashcards', 'legal_movies', 'movie_categories',
      'playlists', 'questoes'
    ],
    'admin_users_recursion_fixed', true,
    'timestamp', now()
  )
) ON CONFLICT DO NOTHING;