import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Play, BookOpen, Clock, ChevronRight, PlayCircle, TrendingUp, FileText } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { normalizeVideoUrl } from '@/utils/videoHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CursosVideoPlayer } from '@/components/CursosVideoPlayer';
import { Progress } from '@/components/ui/progress';
import ReactMarkdown from 'react-markdown';
import ProfessoraIA from '../ProfessoraIA';
import { ProfessoraIAFloatingButton } from '../ProfessoraIAFloatingButton';
import { LessonActionButtons } from './LessonActionButtons';

interface ArtigoData {
  id: number;
  area: string;
  artigo: string;
  link_artigo: string;
  texto_artigo: string;
  analise: string;
  capa_artigo: string;
  capa_area: string;
}

interface CursoArtigoPorArtigoProps {
  onBack: () => void;
}

export const CursoArtigoPorArtigo = ({ onBack }: CursoArtigoPorArtigoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedArtigo, setSelectedArtigo] = useState<ArtigoData | null>(null);
  const [showAnalise, setShowAnalise] = useState(false);
  const [showProfessora, setShowProfessora] = useState(false);

  const { data: rawData, isLoading } = useOptimizedQuery<any[]>({
    queryKey: ['curso-artigos-leis'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fetch_artigos_leis');
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    useExternalCache: true,
  });

  const artigos = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((item: any) => ({
      id: item.id,
      area: item.area || '',
      artigo: item.artigo || '',
      link_artigo: item.link_artigo || '',
      texto_artigo: item.texto_artigo || '',
      analise: item.analise || '',
      capa_artigo: item.capa_artigo || '',
      capa_area: item.capa_area || '',
    })) as ArtigoData[];
  }, [rawData]);

  const areas = useMemo(() => {
    const uniqueAreas = [...new Set(artigos.map(item => item.area))].filter(Boolean);
    return uniqueAreas;
  }, [artigos]);

  const artigosByArea = useMemo(() => {
    if (!selectedArea) return [];
    return artigos.filter(item => item.area === selectedArea);
  }, [artigos, selectedArea]);

  const filteredAreas = areas.filter(area => 
    area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArtigos = artigosByArea.filter(artigo =>
    artigo.artigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artigo.texto_artigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocalBack = () => {
    if (selectedArtigo) {
      setSelectedArtigo(null);
    } else if (selectedArea) {
      setSelectedArea(null);
    } else {
      onBack();
    }
  };

  const getTitle = () => {
    if (selectedArtigo) return `Art. ${selectedArtigo.artigo} - ${selectedArtigo.area}`;
    if (selectedArea) return selectedArea;
    return 'Artigo por Artigo';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Artigo por Artigo</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando artigos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Visualização de artigo individual
  if (selectedArtigo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLocalBack}
              className="flex items-center gap-2 hover:bg-accent/80"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <div className="ml-4 flex-1">
              <Badge variant="outline" className="mr-2">
                {selectedArtigo.area} - Art. {selectedArtigo.artigo}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Artigo {selectedArtigo.artigo}</h2>
            <Badge variant="outline">{selectedArtigo.area}</Badge>
          </div>

          {/* Vídeo */}
          {selectedArtigo.link_artigo && (
            <div className="mb-6">
              <CursosVideoPlayer 
                videoUrl={normalizeVideoUrl(selectedArtigo.link_artigo)} 
                title={`Art. ${selectedArtigo.artigo} - ${selectedArtigo.area}`} 
                subtitle={`Código Civil • Artigo ${selectedArtigo.artigo}`}
                onProgress={() => {}}
                initialTime={0}
                onEnded={() => {}}
                onNearEnd={() => {}}
                autoPlay={true}
                lesson={{
                  id: selectedArtigo.id,
                  area: selectedArtigo.area,
                  tema: `Artigo ${selectedArtigo.artigo}`,
                  assunto: selectedArtigo.texto_artigo,
                  conteudo: selectedArtigo.analise
                }}
              />
            </div>
          )}

          {/* Toggle entre Texto e Análise */}
          {selectedArtigo.texto_artigo && selectedArtigo.analise && (
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Label htmlFor="toggle-content" className={!showAnalise ? 'font-semibold' : ''}>
                Texto do Artigo
              </Label>
              <Switch
                id="toggle-content"
                checked={showAnalise}
                onCheckedChange={setShowAnalise}
              />
              <Label htmlFor="toggle-content" className={showAnalise ? 'font-semibold' : ''}>
                Análise
              </Label>
            </div>
          )}

          {/* Conteúdo */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {showAnalise ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Análise do Artigo</h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-yellow-500 prose-strong:font-bold prose-li:text-muted-foreground prose-ul:space-y-2 prose-ol:space-y-2">
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => <strong className="text-yellow-500 font-bold">{children}</strong>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-2 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="space-y-2 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>
                      }}
                    >
                      {selectedArtigo.analise}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Texto do Artigo</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-base font-medium leading-relaxed">
                      {selectedArtigo.texto_artigo}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <LessonActionButtons lesson={{
            id: selectedArtigo.id,
            area: selectedArtigo.area,
            tema: `Artigo ${selectedArtigo.artigo}`,
            assunto: selectedArtigo.texto_artigo,
            conteudo: selectedArtigo.analise || ''
          }} />
        </div>
        
        <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
        
        <ProfessoraIA 
          video={{
            title: `Art. ${selectedArtigo.artigo} - ${selectedArtigo.area}`,
            area: selectedArtigo.area,
            channelTitle: 'Artigo por Artigo'
          }} 
          isOpen={showProfessora} 
          onClose={() => setShowProfessora(false)} 
        />
      </div>
    );
  }

  // Visualização de área com seus artigos
  if (selectedArea) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selectedArea}</h1>
          </div>
        </div>

        <div className="p-4">
          {/* Header da Área */}
          <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="relative h-48 rounded-t-xl overflow-hidden">
              {artigosByArea[0]?.capa_area && (
                <img 
                  src={artigosByArea[0].capa_area} 
                  alt={selectedArea}
                  className="w-full h-full object-cover" 
                  loading="eager" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-2">{selectedArea}</h1>
              </div>
            </div>
            
            <div className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <FileText className="w-3 h-3" />
                    <span className="font-medium">{artigosByArea.length} artigos</span>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                    <Play className="w-3 h-3" />
                    <span className="font-medium">Vídeos explicativos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar artigos..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10" 
            />
          </div>

          {/* Lista de Artigos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArtigos.map((artigo) => (
              <div 
                key={artigo.id} 
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                onClick={() => setSelectedArtigo(artigo)}
              >
                <div className="relative h-40 overflow-hidden">
                  {artigo.capa_artigo ? (
                    <img 
                      src={artigo.capa_artigo} 
                      alt={`Art. ${artigo.artigo}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1">Art. {artigo.artigo}</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  {artigo.texto_artigo && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {artigo.texto_artigo}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-medium">Assistir</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Lista principal de áreas
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button variant="ghost" size="sm" onClick={handleLocalBack} className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold">Artigo por Artigo</h1>
        </div>
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">{areas.length} áreas</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">{artigos.length} artigos</span>
              </div>
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border">
                <Play className="h-4 w-4 text-primary" />
                <span className="font-medium">Vídeos explicativos</span>
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar áreas..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10" 
            />
          </div>
        </div>

        {/* Lista de Áreas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAreas.map((area: string) => {
            const firstArtigo = artigos.find(item => item.area === area);
            const areaCount = artigos.filter(item => item.area === area).length;
            return (
              <div 
                key={area} 
                className="bg-card rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all group border border-border/50"
                onClick={() => setSelectedArea(area)}
              >
                <div className="relative h-48 overflow-hidden">
                  {firstArtigo?.capa_area ? (
                    <img 
                      src={firstArtigo.capa_area} 
                      alt={area}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1">{area}</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{areaCount} artigos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>Vídeos</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Estude cada artigo com detalhes
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};