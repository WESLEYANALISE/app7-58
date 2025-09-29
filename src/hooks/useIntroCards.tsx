import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IntroCard {
  id: number;
  order: number;
  title: string;
  description: string;
  icon: string;
}

export const useIntroCards = () => {
  const [cards, setCards] = useState<IntroCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntroCards = async () => {
      try {
        // Use direct SQL query to avoid TypeScript table name issues
        const { data, error } = await (supabase as any)
          .from('INTRO')
          .select('*')
          .order('cards', { ascending: true });

        if (error) throw error;

        const formattedCards: IntroCard[] = data?.map((item: any) => ({
          id: item.id,
          order: parseInt(item.cards || '0'),
          title: item['Título'] || '',
          description: item['Descrição'] || '',
          icon: item.icone || ''
        })) || [];

        setCards(formattedCards);
      } catch (err) {
        console.error('Error fetching intro cards:', err);
        setError('Erro ao carregar cards de introdução');
        
        // Fallback cards
        setCards([
          {
            id: 1,
            order: 1,
            title: 'Estude Direito do Seu Jeito!',
            description: 'Mais de 24 ferramentas reunidas para te ajudar a dominar o Direito com praticidade e agilidade.',
            icon: '⚖️'
          },
          {
            id: 2,
            order: 2,
            title: 'Seja Aprovado Mais Rápido!',
            description: 'Materiais atualizados, resumos, eBooks e simulados criados para quem busca aprovação em concursos e OAB.',
            icon: '🎯'
          },
          {
            id: 3,
            order: 3,
            title: 'Consulta Rápida e Inteligente!',
            description: 'Acesse códigos, leis e súmulas em segundos com o nosso buscador avançado e inteligente.',
            icon: '🔍'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchIntroCards();
  }, []);

  return { cards, loading, error };
};