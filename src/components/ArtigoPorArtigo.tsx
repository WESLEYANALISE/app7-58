import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, FileText, Volume2, Square, Play } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { normalizeVideoUrl } from '@/utils/videoHelpers';
import { useArtigoPDFExport } from '@/hooks/useArtigoPDFExport';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ArtigoData {
  id: number;
  area: string;
  artigo: string;
  'link-artigo': string;
  'texto artigo': string;
  analise: string;
  'capa-artigo': string;
  'capa-area': string;
}

export const ArtigoPorArtigo = () => {
  const { setCurrentFunction } = useNavigation();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedArtigo, setSelectedArtigo] = useState<ArtigoData | null>(null);
  const [showAnalise, setShowAnalise] = useState(false);
  const { exporting, exportarArtigo } = useArtigoPDFExport();
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrateLoading, setNarrateLoading] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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
      'link-artigo': item.link_artigo || '',
      'texto artigo': item.texto_artigo || '',
      analise: item.analise || '',
      'capa-artigo': item.capa_artigo || '',
      'capa-area': item.capa_area || '',
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

  const handleBack = () => {
    if (selectedArtigo) {
      setSelectedArtigo(null);
    } else if (selectedArea) {
      setSelectedArea(null);
    } else {
      setCurrentFunction(null);
    }
  };

  const getTitle = () => {
    if (selectedArtigo) return `Art. ${selectedArtigo.artigo} - ${selectedArtigo.area}`;
    if (selectedArea) return selectedArea;
    return 'Artigo por Artigo';
  };

  const narrateArticle = async () => {
    if (!selectedArtigo) return;

    if (isNarrating && audioInstance) {
      // Parar narração
      audioInstance.pause();
      setIsNarrating(false);
      setAudioInstance(null);
      return;
    }

    setNarrateLoading(true);
    
    try {
      const textToNarrate = showAnalise 
        ? `${selectedArtigo.area}, Artigo ${selectedArtigo.artigo}. Análise: ${selectedArtigo.analise}`
        : `${selectedArtigo.area}, Artigo ${selectedArtigo.artigo}. ${selectedArtigo['texto artigo']}`;

      const { data, error } = await supabase.functions.invoke('gemini-article-tts', {
        body: {
          text: textToNarrate,
          voice: 'Zephyr'
        }
      });

      if (error) throw error;

      if (data.success && data.audioData) {
        // Converter base64 para blob e reproduzir
        const binaryString = atob(data.audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsNarrating(false);
          setAudioInstance(null);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsNarrating(false);
          setAudioInstance(null);
          URL.revokeObjectURL(audioUrl);
          toast({
            title: "Erro",
            description: "Erro ao reproduzir áudio.",
            variant: "destructive",
          });
        };

        setAudioInstance(audio);
        setIsNarrating(true);
        audio.play();
        
        toast({
          title: "Narração iniciada",
          description: `${showAnalise ? 'Análise' : 'Artigo'} está sendo narrado.`,
        });
      } else {
        throw new Error('Falha ao gerar áudio');
      }
    } catch (error: any) {
      console.error('Erro ao narrar:', error);
      toast({
        title: "Erro",
        description: "Erro ao narrar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setNarrateLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
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
          <h1 className="ml-4 text-lg font-semibold">{getTitle()}</h1>
        </div>
      </div>

      <div className="p-4">
        {!selectedArea ? (
          // Lista de Áreas
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-6">Selecione uma Área</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {areas.map((area: string) => {
                const firstArtigo = artigos.find(item => item.area === area);
                const areaCount = artigos.filter(item => item.area === area).length;
                return (
                  <Card 
                    key={area} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedArea(area)}
                  >
                    <CardContent className="p-4">
                      {firstArtigo?.['capa-area'] && (
                        <img 
                          src={firstArtigo['capa-area']} 
                          alt={area}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-center">{area}</h3>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        {areaCount} artigos
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : !selectedArtigo ? (
          // Lista de Artigos da Área
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">{selectedArea}</h2>
              <Badge variant="secondary">{artigosByArea.length} artigos</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {artigosByArea.map((artigo) => (
                <Card 
                  key={artigo.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedArtigo(artigo)}
                >
                  <CardContent className="p-4">
                    {artigo['capa-artigo'] && (
                      <img 
                        src={artigo['capa-artigo']} 
                        alt={`Art. ${artigo.artigo}`}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-center">Art. {artigo.artigo}</h3>
                    {artigo['texto artigo'] && (
                      <p className="text-sm text-muted-foreground text-center mt-2 line-clamp-2">
                        {artigo['texto artigo'].slice(0, 100)}...
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Visualização do Artigo
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Artigo {selectedArtigo.artigo}</h2>
              <Badge variant="outline">{selectedArtigo.area}</Badge>
            </div>

            {/* Vídeo */}
            {selectedArtigo['link-artigo'] && (
              <div className="w-full max-w-4xl mx-auto">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    key={selectedArtigo.id}
                    controls
                    className="w-full h-full"
                    src={normalizeVideoUrl(selectedArtigo['link-artigo'])}
                    preload="metadata"
                  >
                    Seu navegador não suporta vídeos.
                  </video>
                </div>
              </div>
            )}

            {/* Toggle entre Texto e Análise */}
            {selectedArtigo['texto artigo'] && selectedArtigo.analise && (
              <div className="flex items-center justify-center space-x-4">
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
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                 {showAnalise ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Análise do Artigo</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={narrateArticle}
                            disabled={narrateLoading}
                            variant="outline"
                            size="sm"
                          >
                            {narrateLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isNarrating ? (
                              <>
                                <Square className="h-4 w-4 mr-2" />
                                Parar
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-4 w-4 mr-2" />
                                Narrar
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => exportarArtigo({
                              tipo: 'explicar',
                              conteudo: selectedArtigo.analise || '',
                              numeroArtigo: selectedArtigo.artigo,
                              nomecodigo: selectedArtigo.area,
                              textoOriginal: selectedArtigo['texto artigo']
                            })}
                            disabled={exporting}
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
                          >
                            {exporting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                PDF
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                     <div className="prose prose-sm max-w-none">
                       {selectedArtigo.analise?.split('\n').map((paragraph, index) => (
                         <p key={index} className="mb-4 text-sm leading-relaxed">
                           {paragraph}
                         </p>
                       ))}
                     </div>
                   </div>
                 ) : (
                   <div>
                     <div className="flex items-center justify-between mb-4">
                       <h3 className="text-lg font-semibold">Texto do Artigo</h3>
                       <Button
                         onClick={narrateArticle}
                         disabled={narrateLoading}
                         variant="outline"
                         size="sm"
                       >
                         {narrateLoading ? (
                           <Loader2 className="h-4 w-4 animate-spin" />
                         ) : isNarrating ? (
                           <>
                             <Square className="h-4 w-4 mr-2" />
                             Parar Narração
                           </>
                         ) : (
                           <>
                             <Volume2 className="h-4 w-4 mr-2" />
                             Narrar Artigo
                           </>
                         )}
                       </Button>
                     </div>
                     <div className="bg-muted/50 p-4 rounded-lg">
                       <p className="text-base font-medium leading-relaxed">
                         {selectedArtigo['texto artigo']}
                       </p>
                     </div>
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};