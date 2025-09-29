import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JuriflixItem {
  id: number;
  tipo: string;
  nome: string;
  ano: string;
  sinopse: string;
  nota: string;
  plataforma: string;
  capa: string;
  beneficios: string;
  link: string;
  trailer: string;
}

export const useJuriflix = () => {
  const [items, setItems] = useState<JuriflixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');

  const fetchJuriflixData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('JURIFLIX' as any)
        .select(`
          id,
          tipo,
          nome,
          ano,
          sinopse,
          nota,
          plataforma,
          capa,
          beneficios,
          link,
          trailer
        `)
        .order('nota', { ascending: false });

      if (error) {
        throw error;
      }

      setItems((data as any[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuriflixData();
  }, []);

  // Filtrar itens baseado na busca e tipo
  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sinopse?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Todos' || item.tipo === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Obter tipos únicos para filtro
  const types = ['Todos', ...Array.from(new Set(items.map(item => item.tipo).filter(Boolean)))];

  // Agrupar por tipo
  const itemsByType = types.slice(1).reduce((acc, type) => {
    acc[type] = items.filter(item => item.tipo === type);
    return acc;
  }, {} as Record<string, JuriflixItem[]>);

  // Obter itens em destaque (com nota mais alta)
  const featuredItems = items
    .filter(item => item.nota)
    .sort((a, b) => parseFloat(b.nota) - parseFloat(a.nota))
    .slice(0, 5);

  return {
    items: filteredItems,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    types,
    itemsByType,
    featuredItems,
    refetch: fetchJuriflixData
  };
};