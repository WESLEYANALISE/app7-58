import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

interface AmbientSound {
  id: number;
  numero: string;
  link: string;
}

export const AmbientSoundPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sounds, setSounds] = useState<AmbientSound[]>([]);
  const [currentSound, setCurrentSound] = useState<AmbientSound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSounds();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const fetchSounds = async () => {
    const { data, error } = await supabase
      .from('SOM AMBIENTE')
      .select('*')
      .order('numero', { ascending: true });

    if (!error && data) {
      setSounds(data);
    }
  };

  const playSound = (sound: AmbientSound) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(sound.link);
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.loop = true;
    
    audioRef.current.play().then(() => {
      setCurrentSound(sound);
      setIsPlaying(true);
    }).catch(error => {
      console.error('Erro ao reproduzir áudio:', error);
    });
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentSound(null);
  };

  useEffect(() => {
    // Cleanup ao desmontar
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Botão Flutuante no canto inferior esquerdo */}
      <motion.div
        className="fixed bottom-6 left-6 z-40"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-700 to-green-500 hover:from-green-600 hover:to-green-400 shadow-lg hover:shadow-xl border-2 border-green-600/50"
          size="lg"
        >
          <Music className="h-7 w-7 text-green-50" />
        </Button>
      </motion.div>

      {/* Modal da Playlist */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-[90vw] sm:max-w-md sm:h-auto max-h-[90vh] bg-background rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-700 to-green-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="h-6 w-6 text-white" />
                  <h3 className="text-lg font-semibold text-white">Som Ambiente</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Player atual */}
              {currentSound && (
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Tocando agora
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Som Ambiente #{currentSound.numero}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlayPause}
                        className="h-10 w-10"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={stopSound}
                        className="h-10 w-10"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="h-8 w-8"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume * 100]}
                      onValueChange={(values) => {
                        const newVolume = values[0] / 100;
                        setVolume(newVolume);
                        if (newVolume > 0 && isMuted) {
                          setIsMuted(false);
                        }
                      }}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Lista de Sons */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-2">
                  {sounds.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum som ambiente disponível
                    </p>
                  ) : (
                    sounds.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => playSound(sound)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          currentSound?.id === sound.id
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Music className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">
                                Som Ambiente #{sound.numero}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Clique para ouvir
                              </p>
                            </div>
                          </div>
                          {currentSound?.id === sound.id && isPlaying && (
                            <div className="flex gap-1">
                              <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" />
                              <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse delay-75" />
                              <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse delay-150" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
