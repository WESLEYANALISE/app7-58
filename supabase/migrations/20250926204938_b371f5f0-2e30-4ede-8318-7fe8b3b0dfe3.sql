-- Habilitar RLS e criar políticas para tabela MAPAS MENTAIS

-- Verificar se a tabela existe e habilitar RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'MAPAS MENTAIS') THEN
    ALTER TABLE "MAPAS MENTAIS" ENABLE ROW LEVEL SECURITY;
    
    -- Remover políticas existentes se houver
    DROP POLICY IF EXISTS "mapas_mentais_public_read" ON "MAPAS MENTAIS";
    
    -- Criar política para permitir leitura pública
    -- Mapas mentais são conteúdo educacional e podem ser públicos
    CREATE POLICY "mapas_mentais_public_read" 
    ON "MAPAS MENTAIS" 
    FOR SELECT 
    USING (true);
    
    RAISE NOTICE 'Políticas RLS configuradas para MAPAS MENTAIS';
  ELSE
    RAISE NOTICE 'Tabela MAPAS MENTAIS não encontrada';
  END IF;
END $$;

-- Criar função para buscar áreas únicas dos mapas mentais
CREATE OR REPLACE FUNCTION get_mapas_mentais_areas()
RETURNS TABLE(area text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT "Área"::text as area
  FROM "MAPAS MENTAIS"
  WHERE "Área" IS NOT NULL AND "Área" != ''
  ORDER BY "Área";
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao buscar áreas: %', SQLERRM;
    RETURN;
END;
$$;

-- Criar função para buscar temas por área
CREATE OR REPLACE FUNCTION get_mapas_mentais_temas(area_param text)
RETURNS TABLE(tema text, ordem_tema text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT "Tema"::text as tema, "Ordem Tema"::text as ordem_tema
  FROM "MAPAS MENTAIS"
  WHERE "Área" = area_param 
    AND "Tema" IS NOT NULL 
    AND "Tema" != ''
  ORDER BY "Ordem Tema", "Tema";
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao buscar temas: %', SQLERRM;
    RETURN;
END;
$$;

-- Criar função para buscar subtemas por área e tema
CREATE OR REPLACE FUNCTION get_mapas_mentais_subtemas(area_param text, tema_param text)
RETURNS TABLE(
  id bigint,
  area text,
  tema text,
  subtema text,
  conteudo text,
  ordem_tema text,
  ordem_subtema text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mm.id,
    mm."Área"::text as area,
    mm."Tema"::text as tema,
    mm."Subtema"::text as subtema,
    mm."Conteúdo"::text as conteudo,
    mm."Ordem Tema"::text as ordem_tema,
    mm."Ordem Subtema"::text as ordem_subtema
  FROM "MAPAS MENTAIS" mm
  WHERE mm."Área" = area_param 
    AND mm."Tema" = tema_param
    AND mm."Subtema" IS NOT NULL 
    AND mm."Subtema" != ''
  ORDER BY mm."Ordem Subtema", mm."Subtema";
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao buscar subtemas: %', SQLERRM;
    RETURN;
END;
$$;