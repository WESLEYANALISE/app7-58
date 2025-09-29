import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, Download, FolderOpen, FileText, ArrowLeft } from 'lucide-react';
import { usePeticoesPorCategoria, PeticaoModel } from '@/hooks/usePeticoes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigation } from '@/context/NavigationContext';

const Peticoes = () => {
  const { categorias, totalModelos, isLoading, error } = usePeticoesPorCategoria();
  const { toast } = useToast();
  const { setCurrentFunction } = useNavigation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleBack = () => {
    setCurrentFunction(null);
  };

  // Filtrar petições baseado na busca
  const filteredData = useMemo(() => {
    if (!searchTerm) return categorias;

    const filtered: Record<string, PeticaoModel[]> = {};

    Object.entries(categorias).forEach(([letter, peticoes]) => {
      const filteredPeticoes = peticoes.filter(peticao => {
        return peticao['Petições'].toLowerCase().includes(searchTerm.toLowerCase());
      });

      if (filteredPeticoes.length > 0) {
        filtered[letter] = filteredPeticoes;
      }
    });

    return filtered;
  }, [categorias, searchTerm]);

  const handleDownload = (link: string, nome: string) => {
    window.open(link, '_blank');
    toast({
      title: "Abrindo pasta de modelos",
      description: `Acesse os modelos de ${nome}`,
      duration: 3000,
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 hover:bg-accent/80">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Petições Jurídicas</h1>
          </div>
        </div>

        <div className="flex items-center justify-center h-64 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Erro ao carregar petições</h3>
                <p className="text-muted-foreground">Tente novamente em alguns instantes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 hover:bg-accent/80">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Petições Jurídicas</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalFiltered = Object.values(filteredData).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 hover:bg-accent/80">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Petições Jurídicas</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Header Content */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Modelos de Petições</h2>
              <p className="text-muted-foreground">
                <span className="font-semibold text-primary">35 mil</span> modelos de petições disponíveis para <span className="font-semibold text-primary">63 áreas</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por área ou tipo de petição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>


              {searchTerm && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  Mostrando {totalFiltered} resultado(s) para "{searchTerm}"
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {Object.entries(filteredData).sort().map(([letter, peticoes]) => (
              <div key={letter}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                    {letter}
                  </Badge>
                  <Separator className="flex-1" />
                  <span className="text-sm text-muted-foreground">
                    {peticoes.length} modelo(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {peticoes.map((peticao) => (
                    <Card key={peticao.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-start gap-2">
                          <FolderOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{peticao['Petições']}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Button
                          onClick={() => handleDownload(peticao['Link'], peticao['Petições'])}
                          className="w-full"
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Acessar Modelos
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {totalFiltered === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground">
                Tente buscar com outros termos ou navegue pelas categorias
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Stats Footer */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">35 mil</div>
                <div className="text-sm text-muted-foreground">Modelos Disponíveis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">63</div>
                <div className="text-sm text-muted-foreground">Áreas Jurídicas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">✓</div>
                <div className="text-sm text-muted-foreground">Grátis</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Peticoes;