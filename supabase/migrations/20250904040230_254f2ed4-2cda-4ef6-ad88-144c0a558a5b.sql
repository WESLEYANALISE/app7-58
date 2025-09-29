-- Update existing profiles trigger to handle new user signup data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into perfis table
  INSERT INTO public.perfis (id, nome_completo, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Insert into user_settings if profile_type is provided
  IF NEW.raw_user_meta_data->>'profile_type' IS NOT NULL THEN
    INSERT INTO public.user_settings (user_id, profile_type)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'profile_type'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;