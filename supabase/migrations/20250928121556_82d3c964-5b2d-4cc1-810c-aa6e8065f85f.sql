-- Adicionar campo telefone na tabela perfis
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Criar tabela para códigos de recuperação por telefone
CREATE TABLE IF NOT EXISTS public.phone_recovery_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.phone_recovery_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para phone_recovery_codes
CREATE POLICY "Users can insert their own recovery codes" ON public.phone_recovery_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recovery codes" ON public.phone_recovery_codes
  FOR SELECT USING (auth.uid() = user_id);

-- Função para limpar códigos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_recovery_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.phone_recovery_codes 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_phone_recovery_codes_phone ON public.phone_recovery_codes(phone);
CREATE INDEX IF NOT EXISTS idx_phone_recovery_codes_expires_at ON public.phone_recovery_codes(expires_at);

-- Função para verificar se email já existe
CREATE OR REPLACE FUNCTION public.check_email_exists(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = email_input
  );
END;
$$;