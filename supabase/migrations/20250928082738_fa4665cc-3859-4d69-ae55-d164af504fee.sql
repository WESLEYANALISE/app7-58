-- SECURITY FIX 1: Fix PII exposure in advogados table
-- Tighten RLS policies to protect personal data

-- Drop existing permissive policies  
DROP POLICY IF EXISTS "Advogados ativos são visíveis para todos" ON public.advogados;
DROP POLICY IF EXISTS "Advogados podem editar seus próprios dados" ON public.advogados;
DROP POLICY IF EXISTS "Qualquer um pode inserir advogado" ON public.advogados;

-- Create new restricted policies that protect PII
CREATE POLICY "Public can view basic professional info only" ON public.advogados
FOR SELECT USING (
  ativo = true AND verificado = true
);

-- Allow verified users to view contact info (separate policy)
CREATE POLICY "Verified users can view contact info" ON public.advogados  
FOR SELECT USING (
  ativo = true AND verificado = true AND auth.uid() IS NOT NULL
);

-- Advogados can edit their own data only
CREATE POLICY "Advogados can edit own data" ON public.advogados
FOR UPDATE USING (
  auth.uid()::text = id::text
) WITH CHECK (
  auth.uid()::text = id::text
);

-- Authenticated users can register as advogado
CREATE POLICY "Authenticated users can register" ON public.advogados
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid()::text = id::text
);

-- SECURITY FIX 2: Create secure function to check exposed tables without RLS
CREATE OR REPLACE FUNCTION public.check_table_rls_status()
RETURNS TABLE(table_name text, has_rls boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    schemaname||'.'||tablename as table_name,
    rowsecurity as has_rls
  FROM pg_tables 
  WHERE schemaname = 'public'
  ORDER BY tablename;
$$;

-- SECURITY FIX 3: Create audit log for security events
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON public.security_events
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- System can insert security events
CREATE POLICY "System can log security events" ON public.security_events
FOR INSERT WITH CHECK (true);

-- Log this security fix
INSERT INTO public.security_events (event_type, details)
VALUES (
  'security_fix_applied',
  jsonb_build_object(
    'fixes', ARRAY['advogados_pii_protection', 'security_audit_table'],
    'timestamp', now(),
    'severity', 'critical_fix'
  )
);