-- Insert missing profile for current user
INSERT INTO public.perfis (id, nome_completo, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'nome_completo', split_part(au.email, '@', 1)) as nome_completo,
  au.email,
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.perfis p ON p.id = au.id
WHERE p.id IS NULL;

-- Ensure the handle_new_user trigger works correctly by recreating it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, email, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.created_at,
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into user_settings if profile_type is provided
  IF NEW.raw_user_meta_data->>'profile_type' IS NOT NULL THEN
    INSERT INTO public.user_settings (id, profile_type, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'profile_type',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;