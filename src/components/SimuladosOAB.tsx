import React, { useEffect, useState } from 'react';
import { WebView } from '@/components/WebView';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigation } from '@/context/NavigationContext';

export const SimuladosOAB = () => {
  const { setCurrentFunction } = useNavigation();
  const [link, setLink] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLink = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('APP')
          .select('link')
          .eq('funcao', 'Simulados OAB')
          .single();

        if (error) throw error;
        setLink(data?.link || '');
      } catch (error) {
        console.error('Erro ao carregar link:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o link",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLink();
  }, []);

  const handleClose = () => {
    setCurrentFunction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Link não encontrado</h2>
          <p className="text-muted-foreground">Não foi possível carregar os simulados OAB</p>
        </div>
      </div>
    );
  }

  return <WebView url={link} title="Simulados OAB" onClose={handleClose} />;
};