-- REFATORAÇÃO COMPLETA DO SISTEMA DE CADASTRO DE USUÁRIOS

-- 1. Corrigir o check constraint da tabela user_settings para aceitar os tipos corretos
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_profile_type_check;
ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_profile_type_check 
  CHECK (profile_type = ANY (ARRAY['faculdade'::text, 'concurso'::text, 'oab'::text, 'advogado'::text]));

-- 2. Recriar a função handle_new_user com tratamento robusto de erros
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  profile_type_value TEXT;
  nome_completo_value TEXT;
BEGIN
  -- Log do início da execução
  RAISE LOG 'handle_new_user: Starting for user %', NEW.id;
  
  -- Validar e extrair dados do metadata
  profile_type_value := NEW.raw_user_meta_data->>'profile_type';
  nome_completo_value := COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1));
  
  -- Validar se o profile_type é válido
  IF profile_type_value IS NOT NULL AND profile_type_value NOT IN ('faculdade', 'concurso', 'oab', 'advogado') THEN
    RAISE WARNING 'Invalid profile_type: %. Setting to NULL.', profile_type_value;
    profile_type_value := NULL;
  END IF;
  
  -- Insert into perfis table com tratamento de conflito
  BEGIN
    INSERT INTO public.perfis (id, nome_completo, email, created_at, updated_at)
    VALUES (
      NEW.id, 
      nome_completo_value,
      NEW.email,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      nome_completo = COALESCE(EXCLUDED.nome_completo, perfis.nome_completo),
      email = EXCLUDED.email,
      updated_at = now();
    
    RAISE LOG 'handle_new_user: Profile created/updated for user %', NEW.id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error inserting into perfis for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Insert into user_settings apenas se profile_type for válido
  IF profile_type_value IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_settings (id, profile_type, created_at, updated_at)
      VALUES (
        NEW.id,
        profile_type_value,
        now(),
        now()
      )
      ON CONFLICT (id) DO UPDATE SET
        profile_type = EXCLUDED.profile_type,
        updated_at = now();
      
      RAISE LOG 'handle_new_user: Settings created/updated for user % with profile_type %', NEW.id, profile_type_value;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error inserting into user_settings for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RAISE LOG 'handle_new_user: Completed successfully for user %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log crítico mas não falha o cadastro do usuário
    RAISE WARNING 'Critical error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar e corrigir políticas RLS da tabela perfis
-- Garantir que usuários podem inserir e visualizar seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profile" ON public.perfis;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.perfis;
DROP POLICY IF EXISTS "Users can update own profile" ON public.perfis;

CREATE POLICY "Users can view own profile" 
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.perfis FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.perfis FOR UPDATE
  USING (auth.uid() = id);

-- 4. Verificar e corrigir políticas RLS da tabela user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" 
  ON public.user_settings FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" 
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own settings" 
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = id);

-- 5. Criar função utilitária para buscar perfil completo do usuário
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid)
RETURNS TABLE(
  id uuid,
  nome_completo text,
  email text,
  profile_type text,
  foto_perfil_url text,
  tipo_usuario text,
  progresso_estudo integer,
  nivel integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    p.email,
    us.profile_type,
    p.foto_perfil_url,
    p.tipo_usuario,
    p.progresso_estudo,
    p.nivel,
    p.created_at,
    p.updated_at
  FROM public.perfis p
  LEFT JOIN public.user_settings us ON p.id = us.id
  WHERE p.id = user_uuid;
END;
$function$;

-- 6. Criar tabela de logs de cadastro para monitoramento
CREATE TABLE IF NOT EXISTS public.user_registration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.user_registration_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver os logs
CREATE POLICY "Only admins can view registration logs" 
  ON public.user_registration_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = auth.uid()
    )
  );

-- 7. Criar função para limpar dados inconsistentes
CREATE OR REPLACE FUNCTION public.cleanup_inconsistent_user_data()
RETURNS TABLE(cleaned_records integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  cleaned_count integer := 0;
BEGIN
  -- Remover registros duplicados na tabela perfis (manter apenas o mais recente)
  WITH duplicates AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) as rn
    FROM public.perfis
  )
  DELETE FROM public.perfis 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Remover settings órfãos (sem perfil correspondente)
  DELETE FROM public.user_settings 
  WHERE id NOT IN (SELECT id FROM public.perfis);
  
  RETURN QUERY SELECT cleaned_count;
END;
$function$;

-- Executar limpeza inicial
SELECT public.cleanup_inconsistent_user_data();

RAISE LOG 'Refatoração completa do sistema de cadastro finalizada com sucesso';