-- Drop existing trigger to recreate it properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert into perfis table with conflict handling
  INSERT INTO public.perfis (id, nome_completo, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    nome_completo = COALESCE(EXCLUDED.nome_completo, perfis.nome_completo),
    email = EXCLUDED.email,
    updated_at = now();
  
  -- Insert into user_settings if profile_type is provided with conflict handling
  IF NEW.raw_user_meta_data->>'profile_type' IS NOT NULL THEN
    INSERT INTO public.user_settings (id, profile_type)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'profile_type'
    )
    ON CONFLICT (id) DO UPDATE SET
      profile_type = EXCLUDED.profile_type,
      updated_at = now();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();