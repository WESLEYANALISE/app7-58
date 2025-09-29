import { useState, useEffect, useRef, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, User, Calendar, FileText, X, Check, SkipForward, Pause, Play, Expand, Minimize, StickyNote, GraduationCap } from 'lucide-react';
import { YouTubePlaylist } from '@/hooks/useYouTube';
import { useToast } from '@/hooks/use-toast';
import { LazyProfessoraIA } from '@/components/lazy/LazyComponents';
import { VideoFloatingButtons } from '@/components/VideoFloatingButtons';
import { useIsMobile } from '@/hooks/use-mobile';
interface VideoPlayerEnhancedProps {
  video: any;
  playlist: YouTubePlaylist;
  onBack: () => void;
}
export const VideoPlayerEnhanced = ({
  video,
  playlist,
  onBack
}: VideoPlayerEnhancedProps) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [notes, setNotes] = useState<{
    [videoId: string]: string;
  }>(() => {
    const saved = localStorage.getItem('videoaulas-notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentNote, setCurrentNote] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showProfessoraIA, setShowProfessoraIA] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const currentVideo = playlist.videos[currentVideoIndex];
  useEffect(() => {
    if (currentVideo) {
      setCurrentNote(notes[currentVideo.id] || '');
    }
  }, [currentVideo, notes]);
  const saveNote = () => {
    if (currentVideo) {
      const newNotes = {
        ...notes,
        [currentVideo.id]: currentNote
      };
      setNotes(newNotes);
      localStorage.setItem('videoaulas-notes', JSON.stringify(newNotes));
      toast({
        title: "Anotação salva!",
        description: "Sua anotação foi salva com sucesso."
      });
      setShowNotes(false);
    }
  };
  const handleVideoSelect = (index: number) => {
    if (index === currentVideoIndex) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentVideoIndex(index);
      setVideoEnded(false);
      setIsPlaying(true);
      setAnimating(false);
    }, 300);
  };
  const handleNextVideo = () => {
    if (currentVideoIndex < playlist.videos.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentVideoIndex(prev => prev + 1);
        setVideoEnded(false);
        setIsPlaying(true);
        setAnimating(false);
      }, 300);
      toast({
        title: "Próximo vídeo!",
        description: `Reproduzindo: ${playlist.videos[currentVideoIndex + 1]?.title}`
      });
    }
  };
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoEnded) {
      setVideoEnded(false);
    }
  };
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  if (!currentVideo) {
    return <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <Card className="text-center p-8">
          <h2 className="font-semibold mb-4">Vídeo não encontrado</h2>
          <Button onClick={onBack}>Voltar</Button>
        </Card>
      </div>;
  }
  return <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 px-0 py-[30px]">
      {/* Header otimizado */}
      <div className="flex items-center gap-4 mb-6 px-[8px]">
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            {playlist.title}
          </h1>
          <p className="text-muted-foreground">
            {playlist.videos.length} vídeos • {video.area}
          </p>
        </div>
        
        {/* Botões otimizados */}
        <div className="flex items-center gap-2">
          
          
          {!isMobile && <Button onClick={() => setShowProfessoraIA(true)} className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white flex items-center gap-2 shadow-lg shadow-red-600/30" size="sm">
              <GraduationCap className="h-4 w-4" />
              Professora IA
            </Button>}
        </div>
      </div>

      <div className={`grid gap-6 ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-3'}`}>
        {/* Video Player otimizado */}
        <div className={isExpanded ? 'col-span-1' : 'xl:col-span-2'}>
          <Card className="mb-6 overflow-hidden">
            <div className={`${isExpanded ? 'aspect-video h-[70vh]' : 'aspect-video'} relative ${animating ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
              {videoEnded ? <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 to-pink-600/90 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Check className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-bold mb-2">Vídeo Concluído!</h3>
                    <p className="mb-6">Parabéns por concluir este vídeo.</p>
                    
                    {currentVideoIndex < playlist.videos.length - 1 ? <div className="space-y-4">
                        <p className="text-sm opacity-90">
                          Próximo vídeo iniciará automaticamente em breve...
                        </p>
                        <Button onClick={handleNextVideo} className="bg-white text-red-600 hover:bg-gray-100">
                          <SkipForward className="h-4 w-4 mr-2" />
                          Próximo Vídeo
                        </Button>
                      </div> : <p className="text-sm opacity-90">
                        Você concluiu toda a playlist! 🎉
                      </p>}
                  </div>
                </div> : <iframe ref={playerRef} src={getEmbedUrl(currentVideo.id)} title={currentVideo.title} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />}
              
              {/* Controles otimizados */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                
              </div>
            </div>
            
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">{currentVideo.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {currentVideo.channelTitle}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentVideo.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(currentVideo.publishedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Anotações otimizadas */}
          {showNotes && <Card className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Minhas Anotações
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowNotes(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea placeholder="Faça suas anotações sobre este vídeo..." value={currentNote} onChange={e => setCurrentNote(e.target.value)} className="min-h-[120px] mb-4" />
                <Button onClick={saveNote} className="w-full">
                  <Check className="h-4 w-4 mr-2" />
                  Salvar Anotação
                </Button>
              </CardContent>
            </Card>}
        </div>

        {/* Playlist Sidebar otimizada */}
        {!isExpanded && <div className="xl:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Lista de Reprodução
                  <span className="text-sm text-muted-foreground">
                    ({playlist.videos.length} vídeos)
                  </span>
                </h3>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {playlist.videos.map((vid, index) => <div key={vid.id} className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${index === currentVideoIndex ? 'bg-red-500/10 border-l-4 border-l-red-500' : 'hover:bg-muted/50'}`} onClick={() => handleVideoSelect(index)}>
                      <div className="flex gap-3">
                        <div className="relative flex-shrink-0">
                          <img src={vid.thumbnail} alt={vid.title} className="w-20 h-12 object-cover rounded" />
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                            {vid.duration}
                          </div>
                          {index === currentVideoIndex && <div className="absolute inset-0 bg-red-500/20 rounded flex items-center justify-center">
                              {isPlaying ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
                            </div>}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium line-clamp-2 ${index === currentVideoIndex ? 'text-red-500' : ''}`}>
                            {vid.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {index + 1}/{playlist.videos.length}
                            </span>
                            {notes[vid.id] && <div className="w-2 h-2 bg-red-500 rounded-full" title="Tem anotações" />}
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>

      {/* Professora IA para Desktop */}
      {!isMobile && <Suspense fallback={null}>
          <LazyProfessoraIA video={currentVideo} area={video.area} isOpen={showProfessoraIA} onClose={() => setShowProfessoraIA(false)} />
        </Suspense>}

      {/* Botões Flutuantes de IA */}
      <VideoFloatingButtons videoTitle={currentVideo.title} videoId={currentVideo.id} channelTitle={currentVideo.channelTitle} />

    </div>;
};