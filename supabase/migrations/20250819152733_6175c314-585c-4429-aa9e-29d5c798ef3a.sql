-- Fix null links in APP table
UPDATE "APP" 
SET link = 'https://video-aulas-juridicas.vercel.app/' 
WHERE id = 8 AND funcao = 'Videoaulas';

UPDATE "APP" 
SET link = 'https://plataforma-desktop-juridica.vercel.app/' 
WHERE id = 18 AND funcao = 'Plataforma Desktop ';

-- Clean up the trailing space in "Plataforma Desktop "
UPDATE "APP" 
SET funcao = 'Plataforma Desktop' 
WHERE id = 18 AND funcao = 'Plataforma Desktop ';