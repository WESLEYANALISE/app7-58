import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MapaEstruturado {
  id: number;
  area: string;
  mapa: string;
  sequencia: string;
  link: string;
}

export const useMapasMentaisEstruturados = () => {
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [mapas, setMapas] = useState<MapaEstruturado[]>([]);
  const { toast } = useToast();

  // Buscar todas as áreas disponíveis
  const loadAreas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('MAPAS MENTAIS-FINAL' as any)
        .select('area')
        .not('area', 'is', null);

      if (error) {
        console.error('Error loading areas:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar áreas dos mapas.",
          variant: "destructive"
        });
        return;
      }

      // Extrair áreas únicas
      const uniqueAreas = Array.from(new Set(data?.map((item: any) => item.area).filter(Boolean)));
      setAreas(uniqueAreas);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar áreas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar mapas de uma área específica
  const loadMapasPorArea = async (area: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('MAPAS MENTAIS-FINAL' as any)
        .select('*')
        .eq('area', area);

      if (error) {
        console.error('Error loading mapas:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar mapas da área.",
          variant: "destructive"
        });
        return;
      }

      const mapasFormatados: MapaEstruturado[] = data?.map((item: any) => ({
        id: item.id,
        area: item.area,
        mapa: item.mapa,
        sequencia: item.Sequencia,
        link: item.link
      })) || [];

      // ORDENAÇÃO NUMÉRICA FORÇADA pela sequência
      mapasFormatados.sort((a, b) => {
        const seqA = parseInt(a.sequencia?.toString() || '0') || 0;
        const seqB = parseInt(b.sequencia?.toString() || '0') || 0;
        return seqA - seqB;
      });

      setMapas(mapasFormatados);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar mapas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar todos os mapas
  const loadTodosMapas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('MAPAS MENTAIS-FINAL' as any)
        .select('*');

      if (error) {
        console.error('Error loading all mapas:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar todos os mapas.",
          variant: "destructive"
        });
        return;
      }

      const mapasFormatados: MapaEstruturado[] = data?.map((item: any) => ({
        id: item.id,
        area: item.area,
        mapa: item.mapa,
        sequencia: item.Sequencia,
        link: item.link
      })) || [];

      // ORDENAÇÃO NUMÉRICA FORÇADA: primeiro por área, depois por sequência
      mapasFormatados.sort((a, b) => {
        // Primeiro por área alfabeticamente
        if (a.area !== b.area) {
          return a.area.localeCompare(b.area);
        }
        // Depois por sequência numérica
        const seqA = parseInt(a.sequencia?.toString() || '0') || 0;
        const seqB = parseInt(b.sequencia?.toString() || '0') || 0;
        return seqA - seqB;
      });

      setMapas(mapasFormatados);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar mapas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Baixar mapa (abrir link em nova aba)
  const baixarMapa = (link: string, nomeMapa: string) => {
    try {
      window.open(link, '_blank');
      toast({
        title: "Abrindo Mapa",
        description: `${nomeMapa} será aberto em uma nova aba.`
      });
    } catch (error) {
      console.error('Error opening link:', error);
      toast({
        title: "Erro",
        description: "Falha ao abrir o link do mapa.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  return {
    loading,
    areas,
    mapas,
    loadAreas,
    loadMapasPorArea,
    loadTodosMapas,
    baixarMapa
  };
};