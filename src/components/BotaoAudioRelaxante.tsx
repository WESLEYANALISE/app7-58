import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Music, Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';


export const BotaoAudioRelaxante = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<number | null>(null);
  const [volume, setVolume] = useState([0.5]);
  const [isMuted, setIsMuted] = useState(false);
  const [somAmbiente, setSomAmbiente] = useState<any[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carregar apenas músicas reais da tabela "SOM AMBIENTE"
    const loadSons = async () => {
      try {
        const { data, error } = await supabase
          .from('SOM AMBIENTE')
          .select('id, numero, link')
          .order('numero', { ascending: true });
        if (error) throw error;
        setSomAmbiente((data || []).map((d) => ({ id: d.id, numero: Number(d.numero), link: d.link })));
      } catch (e) {
        console.warn('Falha ao carregar SOM AMBIENTE:', e);
        setSomAmbiente([]);
      }
    };
    loadSons();
  }, []);

  // Limpa o áudio apenas ao desmontar o componente
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0];
    }
  }, [volume, isMuted]);

  const normalizeUrl = (url: string) => {
    if (!url) return url;

    // Normaliza links do Dropbox para reprodução
    if (url.includes('dropbox.com')) {
      try {
        const u = new URL(url);
        const path = u.pathname;

        // Garante download direto
        if (u.searchParams.get('dl') !== '1') {
          u.searchParams.set('dl', '1');
        }

        // Para links no formato /s/... usar domínio raw
        if (path.startsWith('/s/')) {
          return `https://dl.dropboxusercontent.com${path}`;
        }

        // Para /scl/fi/... manter domínio original com dl=1
        return u.toString();
      } catch {
        // Fallback simples
        if (url.includes('?dl=0')) return url.replace('?dl=0', '?dl=1');
      }
    }

    // Normalizar http para https
    if (url.startsWith('http://')) {
      return `https://${url.slice(7)}`;
    }

    return url;
  };

  const playTrack = (trackId: number) => {
    const track = somAmbiente.find(m => m.id === trackId);
    if (!track) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio();
    audioRef.current.src = normalizeUrl(track.link);
    audioRef.current.loop = true;
    audioRef.current.preload = 'auto';
    audioRef.current.volume = isMuted ? 0 : volume[0];
    
    // Adicionar listeners para melhor controle de erros
    audioRef.current.onerror = (e) => {
      console.error('Erro ao carregar áudio:', e);
    };
    
    audioRef.current.oncanplay = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error('Erro ao reproduzir áudio:', error);
        });
      }
    };
    
    audioRef.current.load(); // Força o carregamento
    
    // Tentar iniciar imediatamente (gesto do usuário)
    audioRef.current.play().catch((err) => console.warn('Play inicial falhou, aguardando canplay', err));
    
    setCurrentTrack(trackId);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentTrackData = currentTrack ? somAmbiente.find(m => m.id === currentTrack) : null;

  return (
    <>
      {/* Botão flutuante */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-4 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl border-2 border-white/20"
        size="lg"
      >
        <Music className="h-6 w-6 text-white" />
      </Button>

      {/* Indicador de música tocando */}
      <AnimatePresence>
        {isPlaying && currentTrackData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 z-30"
          >
            <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-sm text-foreground font-medium">
                    {currentTrackData ? `Ambiente ${currentTrackData.numero}` : ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="h-6 w-6 p-0"
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de seleção */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-green-500" />
              Música para Concentração
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Controles de volume */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(volume[0] * 100)}%
              </span>
            </div>

            {/* Lista de músicas */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {somAmbiente.map((som) => (
                <Card
                  key={som.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    currentTrack === som.id
                      ? 'border-primary bg-primary/10 dark:bg-primary/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => playTrack(som.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          {`Ambiente ${som.numero}`}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Som ambiente para concentração
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentTrack === som.id && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Controles de reprodução */}
            {currentTrack && (
              <div className="flex items-center justify-center gap-2 p-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 mr-1" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  {isPlaying ? 'Pausar' : 'Reproduzir'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopTrack}
                >
                  Parar
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center">
              💡 A música ajuda na concentração durante a leitura
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};