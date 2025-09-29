-- Criar função para buscar artigos da tabela CURSO-ARTIGOS-LEIS
CREATE OR REPLACE FUNCTION public.fetch_artigos_leis()
RETURNS TABLE(
  id bigint,
  area text,
  artigo text,
  link_artigo text,
  texto_artigo text,
  analise text,
  capa_artigo text,
  capa_area text
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    cal.id,
    cal.area,
    cal.artigo,
    cal."link-artigo" as link_artigo,
    cal."texto artigo" as texto_artigo,
    cal.analise,
    cal."capa-artigo" as capa_artigo,
    cal."capa-area" as capa_area
  FROM "CURSO-ARTIGOS-LEIS" cal
  WHERE cal.area IS NOT NULL
  ORDER BY cal.area, cal.artigo;
END;
$function$;