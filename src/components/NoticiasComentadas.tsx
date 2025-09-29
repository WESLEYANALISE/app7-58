
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useAppFunctions } from '@/hooks/useAppFunctions';
import { NewsArticleSummary } from './NewsArticleSummary';
import { useNewsUpdates } from '@/hooks/useNewsUpdates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const NoticiasComentadas = () => {
  const { setCurrentFunction } = useNavigation();
  const { functions, loading } = useAppFunctions();
  const { latestNews, loading: newsLoading } = useNewsUpdates();

  // Buscar dados específicos de "Notícias Comentadas" da tabela APP
  const noticiasData = functions.find(func => 
    func.funcao?.toLowerCase().trim() === 'notícias comentadas' || 
    func.funcao?.toLowerCase().includes('noticias comentadas') || 
    func.funcao?.toLowerCase().includes('notícias comentadas')
  );

  const handleBack = () => {
    setCurrentFunction(null);
  };

  return (
    <div className="fixed inset-0 bg-background">
      {/* Header Consistente */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Notícias Comentadas</h1>
        </div>
      </div>
      
      {/* Conteúdo da página */}
      <div className="pt-14 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Cabeçalho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Notícias Jurídicas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Clique em "Resumir" em qualquer notícia para obter uma análise completa com IA. 
                Após o resumo, você poderá fazer perguntas específicas sobre o conteúdo.
              </p>
            </CardContent>
          </Card>

          {/* Lista de notícias */}
          {newsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="space-y-6">
              {latestNews.map((news, index) => (
                <NewsArticleSummary
                  key={news.id}
                  newsTitle={news.Titulo || `Notícia Jurídica ${index + 1}`}
                  newsUrl={news.link || `https://www.conjur.com.br/noticia-${news.id}`}
                  newsContent=""
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhuma notícia recente encontrada.
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Iframe como referência adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Portal de Notícias Externo</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <iframe 
                src="https://noticia-juridica.vercel.app/" 
                className="w-full h-96 border-0 rounded-b-lg" 
                title="Notícias Comentadas" 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
