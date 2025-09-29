-- Insert missing user_settings for existing user with correct value
INSERT INTO public.user_settings (id, profile_type) 
VALUES ('cc652ba1-326d-42dd-acce-a2c80e7a85d5', 'concurso')
ON CONFLICT (id) DO NOTHING;