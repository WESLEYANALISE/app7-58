import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Função para normalizar URLs de áudio do Dropbox
const normalizeAudioUrl = (url: string): string => {
  if (!url) return '';
  
  // Converter links do Dropbox para formato de reprodução direta
  if (url.includes('dropbox.com')) {
    // Garantir que termine com dl=1 para download direto
    if (url.includes('dl=0')) {
      return url.replace('dl=0', 'dl=1');
    }
    if (!url.includes('dl=1') && !url.includes('dl=0')) {
      return url + (url.includes('?') ? '&' : '?') + 'dl=1';
    }
  }
  
  return url;
};

export interface AudioAula {
  id: number;
  area: string;
  tema: string;
  sequencia: string;
  titulo: string;
  descricao: string;
  url_audio: string;
  imagem_miniatura: string;
  tag: string;
}

export interface AreaData {
  area: string;
  temas: {
    [tema: string]: AudioAula[];
  };
}

export const useAudioaulas = () => {
  const [audioaulas, setAudioaulas] = useState<AudioAula[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioaulas = async () => {
      try {
        setLoading(true);
        
        // Use direct fetch to bypass TypeScript restrictions for this table
        const SUPABASE_URL = "https://phzcazcyjhlmdchcjagy.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoemNhemN5amhsbWRjaGNqYWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTM3NzUsImV4cCI6MjA2MDQ4OTc3NX0.oTdOS5KBBHROGkzcyr7-EZJNFvYzkGaBFT3F89YGrZg";
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/AUDIOAULAS?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar audioaulas');
        }
        
        const data = await response.json();

        const normalizedData: AudioAula[] = (data || []).map((item: any) => ({
          id: item.id || 0,
          area: item.area?.trim() || '',
          tema: item.tema?.trim() || '',
          titulo: item.titulo?.trim() || '',
          descricao: item.descricao?.trim() || '',
          url_audio: normalizeAudioUrl(item.url_audio?.trim() || ''),
          imagem_miniatura: item.imagem_miniatura?.trim() || '',
          tag: item.tag?.trim() || '',
          sequencia: item.sequencia?.toString().trim() || '0'
        }));

        // Filtrar itens com dados inválidos
        const validData = normalizedData.filter(item => 
          item.area && item.titulo && item.url_audio
        );

        // Ordenar por área, tema e sequência
        validData.sort((a, b) => {
          if (a.area !== b.area) return a.area.localeCompare(b.area);
          if (a.tema !== b.tema) return a.tema.localeCompare(b.tema);
          const seqA = parseInt(a.sequencia) || 0;
          const seqB = parseInt(b.sequencia) || 0;
          return seqA - seqB;
        });

        setAudioaulas(validData);
        
        // Agrupar por área e tema
        const groupedAreas: { [area: string]: AreaData } = {};
        
        validData.forEach(audioaula => {
          if (!audioaula.area) return;
          
          if (!groupedAreas[audioaula.area]) {
            groupedAreas[audioaula.area] = {
              area: audioaula.area,
              temas: {}
            };
          }
          
          const tema = audioaula.tema || 'Sem Tema';
          if (!groupedAreas[audioaula.area].temas[tema]) {
            groupedAreas[audioaula.area].temas[tema] = [];
          }
          
          groupedAreas[audioaula.area].temas[tema].push(audioaula);
        });

        // Ordenar as aulas dentro de cada tema por sequência numérica
        Object.values(groupedAreas).forEach(area => {
          Object.keys(area.temas).forEach(tema => {
            area.temas[tema].sort((a, b) => {
              const seqA = parseInt(a.sequencia) || 0;
              const seqB = parseInt(b.sequencia) || 0;
              return seqA - seqB;
            });
          });
        });

        setAreas(Object.values(groupedAreas));
        
      } catch (err) {
        console.error('Erro ao carregar audioaulas:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchAudioaulas();
  }, []);

  return { audioaulas, areas, loading, error };
};