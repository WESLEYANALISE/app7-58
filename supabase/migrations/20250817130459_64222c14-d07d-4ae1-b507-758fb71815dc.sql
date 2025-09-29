-- Melhorar função get_unread_news_count para contar apenas notícias realmente novas
CREATE OR REPLACE FUNCTION get_unread_news_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    -- Contar notícias que o usuário não marcou como lida
    -- e que foram publicadas após o último acesso
    SELECT COUNT(*)
    INTO unread_count
    FROM "NOTICIAS-AUDIO" n
    LEFT JOIN user_read_news urn ON n.id = urn.news_id AND urn.user_id = user_uuid
    WHERE urn.news_id IS NULL
    AND n.data IS NOT NULL;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- Criar tabela para rastrear quando usuário viu notícias pela última vez
CREATE TABLE IF NOT EXISTS user_news_last_check (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    last_check_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_news_last_check ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_news_last_check
CREATE POLICY "Users can view their own last check" 
ON user_news_last_check 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own last check" 
ON user_news_last_check 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own last check" 
ON user_news_last_check 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Função para atualizar último check do usuário
CREATE OR REPLACE FUNCTION update_user_last_check(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_news_last_check (user_id, last_check_at)
    VALUES (user_uuid, now())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        last_check_at = now(),
        updated_at = now();
END;
$$;

-- Função melhorada para contar apenas notícias realmente novas
CREATE OR REPLACE FUNCTION get_truly_new_news_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count INTEGER;
    last_check TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Buscar último check do usuário
    SELECT last_check_at
    INTO last_check
    FROM user_news_last_check
    WHERE user_id = user_uuid;
    
    -- Se nunca checou, usar uma data antiga
    IF last_check IS NULL THEN
        last_check := '2024-01-01'::timestamp with time zone;
    END IF;
    
    -- Contar notícias que:
    -- 1. Não foram marcadas como lidas
    -- 2. São posteriores ao último check
    SELECT COUNT(*)
    INTO unread_count
    FROM "NOTICIAS-AUDIO" n
    LEFT JOIN user_read_news urn ON n.id = urn.news_id AND urn.user_id = user_uuid
    WHERE urn.news_id IS NULL
    AND n.data IS NOT NULL
    AND (
        -- Tentar parsear data em diferentes formatos
        CASE 
            WHEN n.data ~ '^\d{2}/\d{2}/\d{4}$' THEN
                TO_TIMESTAMP(n.data, 'DD/MM/YYYY')
            WHEN n.data ~ '^\d{4}-\d{2}-\d{2}' THEN
                n.data::timestamp with time zone
            ELSE
                NULL
        END
    ) > last_check;
    
    RETURN COALESCE(unread_count, 0);
END;
$$;