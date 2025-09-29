
import { useState, useMemo, useEffect } from 'react';
import { useVideos } from '@/hooks/useVideos';
import { useYouTube } from '@/hooks/useYouTube';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Play, ArrowLeft, Clock, PlayCircle, Video, Users, Filter, SortAsc, Grid3X3, List, Eye, Star } from 'lucide-react';
import { VideoPlayerEnhanced } from '@/components/VideoPlayerEnhanced';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const VideoAreasGrid = () => {
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedPlaylistUrl, setSelectedPlaylistUrl] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nome' | 'date' | 'area'>('nome');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [areaThumbnails, setAreaThumbnails] = useState<{ [key: string]: string }>({});
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({});
  
  const { playlist, loading: playlistLoading } = useYouTube(selectedPlaylistUrl);

  // Extrair thumbnail real do YouTube
  const extractYouTubeThumbnail = async (url: string): Promise<string | null> => {
    try {
      // Extrair ID da playlist
      const playlistMatch = url.match(/[?&]list=([^&#]*)/);
      if (playlistMatch) {
        const playlistId = playlistMatch[1];
        
        // Buscar primeiro vídeo da playlist para usar como thumbnail
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=AIzaSyBW9q3wYmx-cvCv5RLz3ex9SCVB5KcftaE`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const firstVideo = data.items[0];
            const videoId = firstVideo.snippet.resourceId.videoId;
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }
      }
      
      // Extrair ID do vídeo individual
      const videoMatch = url.match(/[?&]v=([^&#]*)/);
      if (videoMatch) {
        return `https://img.youtube.com/vi/${videoMatch[1]}/hqdefault.jpg`;
      }
      
      return null;
    } catch (error) {
      console.log('Erro ao extrair thumbnail:', error);
      return null;
    }
  };

  // Agrupar vídeos por área e extrair thumbnails
  const videoAreas = useMemo(() => {
    const areas: {
      [key: string]: {
        videos: typeof videos;
        firstVideo: any;
        thumbnail?: string;
      };
    } = {};
    
    videos.forEach(video => {
      if (!areas[video.area]) {
        areas[video.area] = {
          videos: [],
          firstVideo: video
        };
      }
      areas[video.area].videos.push(video);
    });

    return areas;
  }, [videos]);

  // Carregar thumbnails das áreas
  useEffect(() => {
    const loadAreaThumbnails = async () => {
      for (const [area, data] of Object.entries(videoAreas)) {
        if (!areaThumbnails[area] && data.firstVideo?.link) {
          const thumbnail = await extractYouTubeThumbnail(data.firstVideo.link);
          if (thumbnail) {
            setAreaThumbnails(prev => ({ ...prev, [area]: thumbnail }));
          }
        }
      }
    };

    loadAreaThumbnails();
  }, [videoAreas, areaThumbnails]);

  // Carregar thumbnails dos vídeos individuais
  useEffect(() => {
    const loadVideoThumbnails = async () => {
      if (selectedArea && videoAreas[selectedArea]) {
        for (const video of videoAreas[selectedArea].videos) {
          if (!videoThumbnails[video.id] && video.link) {
            const thumbnail = await extractYouTubeThumbnail(video.link);
            if (thumbnail) {
              setVideoThumbnails(prev => ({ ...prev, [video.id]: thumbnail }));
            }
          }
        }
      }
    };

    loadVideoThumbnails();
  }, [selectedArea, videoAreas, videoThumbnails]);

  // Filtrar áreas e vídeos por busca global
  const filteredAreas = useMemo(() => {
    if (!searchTerm) return videoAreas;
    const filtered: typeof videoAreas = {};
    
    Object.entries(videoAreas).forEach(([area, data]) => {
      // Buscar por área
      if (area.toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[area] = data;
      } else {
        // Buscar por vídeos dentro da área
        const matchingVideos = data.videos.filter(video => 
          video.link.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingVideos.length > 0) {
          filtered[area] = { ...data, videos: matchingVideos };
        }
      }
    });
    
    return filtered;
  }, [videoAreas, searchTerm]);

  // Filtrar e ordenar vídeos
  const filteredAndSortedVideos = useMemo(() => {
    if (!selectedArea || !videoAreas[selectedArea]) return [];
    
    let filtered = videoAreas[selectedArea].videos;
    
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.link.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nome':
          return a.link.localeCompare(b.link);
        case 'area':
          return a.area.localeCompare(b.area);
        default:
          return 0;
      }
    });
  }, [selectedArea, videoAreas, searchTerm, sortBy]);

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setSearchTerm(''); // Limpar busca ao trocar de área
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
    setSelectedPlaylistUrl(video.link);
  };

  const handleBack = () => {
    if (selectedVideo) {
      setSelectedVideo(null);
      setSelectedPlaylistUrl('');
    } else if (selectedArea) {
      setSelectedArea('');
      setSearchTerm('');
    }
  };

  if (videosLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (videosError) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <Card className="text-center p-8 border-red-200 dark:border-red-800">
          <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-500 mb-4 font-semibold">Erro ao carregar videoaulas</h2>
          <p className="text-muted-foreground">{videosError}</p>
        </Card>
      </div>
    );
  }

  if (selectedVideo && playlist) {
    return <VideoPlayerEnhanced video={selectedVideo} playlist={playlist} onBack={handleBack} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      {/* Header Profissional */}
      <div className="flex items-center gap-4 mb-6">
        {selectedArea && (
          <Button 
            variant="outline" 
            onClick={handleBack} 
            size="sm" 
            className="bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-500/50 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {selectedArea ? `${selectedArea}` : 'Videoaulas por Área'}
          </h1>
          <p className="text-muted-foreground">
            {selectedArea 
              ? `${filteredAndSortedVideos.length} playlist${filteredAndSortedVideos.length !== 1 ? 's' : ''} disponível${filteredAndSortedVideos.length !== 1 ? 'is' : ''}` 
              : `${Object.keys(filteredAreas).length} áreas de estudo disponíveis`
            }
          </p>
        </div>
      </div>

      {/* Barra de Busca e Controles Profissionais */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={selectedArea ? "Buscar playlist..." : "Buscar área ou videoaula..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-red-200 dark:border-red-800 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        
        {selectedArea && (
          <>
            <Select value={sortBy} onValueChange={(value: 'nome' | 'date' | 'area') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome</SelectItem>
                <SelectItem value="area">Área</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-10 w-10"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-10 w-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {!selectedArea ? (
        // Grid de áreas com thumbnails reais
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(filteredAreas).map(([area, data]) => (
            <Card
              key={area}
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-2 hover:border-red-500/30 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm"
              onClick={() => handleAreaSelect(area)}
            >
              <div className="relative aspect-video overflow-hidden">
                {areaThumbnails[area] ? (
                  <img
                    src={areaThumbnails[area]}
                    alt={area}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => {
                      setAreaThumbnails(prev => ({ ...prev, [area]: '' }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-600/20 via-pink-600/10 to-red-600/20 animate-pulse" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex gap-2">
                  <div className="bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {data.videos.length} PLAYLIST{data.videos.length !== 1 ? 'S' : ''}
                  </div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white transform group-hover:scale-110 transition-transform duration-300">
                    <div className="relative mb-2">
                      <div className="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      <PlayCircle className="h-6 w-6 absolute -bottom-1 -right-1 text-white animate-pulse" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-pink-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:via-pink-500/5 group-hover:to-red-500/10 transition-all duration-500" />
              </div>
              
              <CardContent className="p-4 bg-gradient-to-b from-background to-background/95">
                <h3 className="font-bold text-lg mb-2 group-hover:text-red-500 transition-colors text-center line-clamp-1">
                  📚 {area}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Videoaulas completas</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Grid/List de vídeos da área selecionada
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredAndSortedVideos.map((video, index) => (
            <Card
              key={video.id}
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-red-500/30 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => handleVideoSelect(video)}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} bg-gradient-to-br from-red-500/20 to-pink-500/20`}>
                {videoThumbnails[video.id] ? (
                  <img
                    src={videoThumbnails[video.id]}
                    alt="Vídeo"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => {
                      setVideoThumbnails(prev => ({ ...prev, [video.id]: '' }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-pink-500/20 animate-pulse" />
                )}
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  Playlist
                </div>

                <div className="absolute top-2 right-2 bg-red-600/80 text-white px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                  #{index + 1}
                </div>

                <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 transition-colors duration-300" />
              </div>
              
              <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                  Vídeo {video.id}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {viewMode === 'list' && `Área: ${video.area} • `}
                  Clique para assistir a playlist completa
                </p>
                {viewMode === 'list' && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>Conteúdo profissional</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mensagem quando não há resultados */}
      {((selectedArea && filteredAndSortedVideos.length === 0) || 
        (!selectedArea && Object.keys(filteredAreas).length === 0)) && (
        <Card className="text-center p-8 border-red-200 dark:border-red-800">
          <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-4">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? `Tente buscar por outro termo ou verifique a ortografia.`
              : `Não há ${selectedArea ? 'playlists' : 'áreas'} disponíveis no momento.`
            }
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Limpar busca
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};
