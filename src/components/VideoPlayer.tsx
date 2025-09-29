
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Heart, Clock, User, Calendar, BookOpen, Star, Save } from 'lucide-react';
import { YouTubePlaylist } from '@/hooks/useYouTube';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  video: any;
  playlist: YouTubePlaylist;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (videoId: string) => void;
  watchedVideos: string[];
  onMarkAsWatched: (videoId: string) => void;
}

export const VideoPlayer = ({
  video,
  playlist,
  onBack,
  favorites,
  onToggleFavorite,
  watchedVideos,
  onMarkAsWatched
}: VideoPlayerProps) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [notes, setNotes] = useState<{ [videoId: string]: string }>(() => {
    const saved = localStorage.getItem('videoaulas-notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentNote, setCurrentNote] = useState('');
  const playerRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const currentVideo = playlist.videos[currentVideoIndex];

  useEffect(() => {
    if (currentVideo) {
      setCurrentNote(notes[currentVideo.id] || '');
    }
  }, [currentVideo, notes]);

  const saveNote = () => {
    if (currentVideo) {
      const newNotes = { ...notes, [currentVideo.id]: currentNote };
      setNotes(newNotes);
      localStorage.setItem('videoaulas-notes', JSON.stringify(newNotes));
      toast({
        title: "Anotação salva!",
        description: "Sua anotação foi salva com sucesso.",
      });
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    const selectedVideo = playlist.videos[index];
    if (selectedVideo) {
      onMarkAsWatched(selectedVideo.id);
    }
  };

  const getEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!currentVideo) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <Card className="text-center p-8">
          <CardTitle className="mb-4">Vídeo não encontrado</CardTitle>
          <Button onClick={onBack}>Voltar</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold gradient-text">{playlist.title}</h1>
          <p className="text-muted-foreground">
            {playlist.videos.length} vídeos • {video.area}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <div className="aspect-video">
              <iframe
                ref={playerRef}
                src={getEmbedUrl(currentVideo.id)}
                title={currentVideo.title}
                className="w-full h-full rounded-t-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{currentVideo.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFavorite(currentVideo.id)}
                  className={`${
                    favorites.includes(currentVideo.id)
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className={`h-5 w-5 ${
                      favorites.includes(currentVideo.id) ? 'fill-current' : ''
                    }`} 
                  />
                </Button>
              </div>

              {currentVideo.description && (
                <div className="text-sm text-muted-foreground">
                  <p className="line-clamp-3">{currentVideo.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Minhas Anotações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Faça suas anotações sobre este vídeo..."
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                className="min-h-[120px] mb-4"
              />
              <Button onClick={saveNote} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Anotação
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Playlist Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent-legal" />
                Lista de Reprodução
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {playlist.videos.length} vídeos
              </p>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              {playlist.videos.map((vid, index) => (
                <div
                  key={vid.id}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    index === currentVideoIndex ? 'bg-accent/10 border-l-4 border-l-accent-legal' : ''
                  }`}
                  onClick={() => handleVideoSelect(index)}
                >
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                        {vid.duration}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium line-clamp-2 ${
                        index === currentVideoIndex ? 'text-accent-legal' : ''
                      }`}>
                        {vid.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {index + 1}/{playlist.videos.length}
                        </span>
                        {watchedVideos.includes(vid.id) && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Assistido
                          </span>
                        )}
                        {favorites.includes(vid.id) && (
                          <Heart className="h-3 w-3 text-red-500 fill-current" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
