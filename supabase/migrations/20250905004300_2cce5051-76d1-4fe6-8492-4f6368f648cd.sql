-- Fix the handle_new_user function to handle duplicate key conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into perfis table with conflict handling
  INSERT INTO public.perfis (id, nome_completo, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  
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
END;
$function$;