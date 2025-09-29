-- Enable RLS on critical user-related tables that have policies but RLS disabled
-- This will fix the authentication and profile access issues

-- Enable RLS on perfis table (user profiles)
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_settings table if it exists and has policies
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings') THEN
        EXECUTE 'ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- Enable RLS on other important authentication-related tables
DO $$ 
DECLARE
    table_record RECORD;
BEGIN
    -- Enable RLS on tables that have policies but RLS disabled
    FOR table_record IN 
        SELECT DISTINCT schemaname, tablename
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('perfis', 'user_settings', 'user_subscriptions', 'user_achievements', 'user_profiles')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', table_record.schemaname, table_record.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', table_record.tablename;
    END LOOP;
END $$;