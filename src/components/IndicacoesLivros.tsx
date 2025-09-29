import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Download, Play, Pause, Volume2, Star } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LivroIndicacao {
  id: number;
  Titulo: string;
  Autor: string;
  Sobre: string;
  capa: string;
  Download: string;
  audio: string;
}

interface LivroDetailProps {
  livro: LivroIndicacao;
  onBack: () => void;
}

const LivroDetail: React.FC<LivroDetailProps> = ({ livro, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center h-full px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 hover:bg-accent/80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={3} />
            Voltar
          </Button>
          <h1 className="ml-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
            {livro.Titulo}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Capa do Livro */}
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <Card className="overflow-hidden">
                    <div className="aspect-[3/4] max-w-64 mx-auto bg-gradient-to-br from-primary/10 to-primary/20">
                    {livro.capa ? (
                      <img
                        src={livro.capa}
                        alt={livro.Titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/50" />
                      </div>
                    )}
                  </div>
                  
                  {/* Controles de Áudio */}
                  {livro.audio && (
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={handlePlayPause}
                            size="lg"
                            className="flex-shrink-0 bg-primary hover:bg-primary/90"
                          >
                            {isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                              <Volume2 className="h-4 w-4" />
                              <span>Audiolivro</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {duration > 0 && `${formatTime(currentTime)} / ${formatTime(duration)}`}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {duration > 0 && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        )}
                        
                        <audio
                          ref={audioRef}
                          src={livro.audio}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onEnded={() => setIsPlaying(false)}
                        />
                      </div>
                    </CardContent>
                  )}
                  
                  {/* Botão de Download */}
                  {livro.Download && (
                    <CardContent className="p-4 pt-0">
                      <Button
                        onClick={() => window.open(livro.Download, '_blank')}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>

            {/* Informações do Livro */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">{livro.Titulo}</h1>
                {livro.Autor && (
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Star className="h-3 w-3 mr-1" />
                      {livro.Autor}
                    </Badge>
                  </div>
                )}
              </div>

              {livro.Sobre && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Sobre o Livro</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {livro.Sobre}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recursos Disponíveis */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">Recursos Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {livro.audio && (
                      <div className="flex items-center gap-2 text-sm">
                        <Volume2 className="h-4 w-4 text-primary" />
                        <span>Audiolivro completo</span>
                      </div>
                    )}
                    {livro.Download && (
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="h-4 w-4 text-primary" />
                        <span>Download em PDF</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span>Leitura recomendada</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-primary" />
                      <span>Curadoria especializada</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const IndicacoesLivros = () => {
  const { setCurrentFunction } = useNavigation();
  const [livros, setLivros] = useState<LivroIndicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLivro, setSelectedLivro] = useState<LivroIndicacao | null>(null);

  useEffect(() => {
    const loadLivros = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('LIVROS-INDICACAO')
          .select('*')
          .order('Titulo', { ascending: true });

        if (error) throw error;
        setLivros(data || []);
      } catch (error) {
        console.error('Erro ao carregar indicações de livros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as indicações de livros",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLivros();
  }, []);

  const handleBack = () => {
    setCurrentFunction(null);
  };

  const handleLivroClick = (livro: LivroIndicacao) => {
    setSelectedLivro(livro);
  };

  const handleBackToList = () => {
    setSelectedLivro(null);
  };

  if (selectedLivro) {
    return <LivroDetail livro={selectedLivro} onBack={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando indicações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <h1 className="ml-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Indicações de Livros
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Indicações Jurídicas</h2>
            <p className="text-muted-foreground">
              Livros selecionados para aprimorar seus conhecimentos jurídicos
            </p>
          </div>

          <div className="space-y-6">
            {livros.map((livro) => (
              <Card 
                key={livro.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleLivroClick(livro)}
              >
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    {/* Capa */}
                    <div className="flex-shrink-0 w-20 h-28 md:w-24 md:h-32">
                      {livro.capa ? (
                        <img
                          src={livro.capa}
                          alt={livro.Titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-primary/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 py-2">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {livro.Titulo}
                          </h3>
                          {livro.Autor && (
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                <Star className="h-3 w-3 mr-1" />
                                {livro.Autor}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {livro.Sobre && (
                          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                            {livro.Sobre}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {livro.audio && (
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              <Volume2 className="h-3 w-3 mr-1" />
                              Audiolivro
                            </Badge>
                          )}
                          {livro.Download && (
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Recomendado
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-muted-foreground">
                            Clique para ver detalhes
                          </div>
                          <ArrowLeft className="h-4 w-4 text-primary rotate-180 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {livros.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma indicação encontrada</h3>
              <p className="text-muted-foreground">
                As indicações de livros serão carregadas em breve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};