import React, { useMemo, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Play, Clock, Video, ChevronRight, Users, Star } from 'lucide-react';
import { useVideos } from '@/hooks/useVideos';
import { useYouTube } from '@/hooks/useYouTube';
import { VideoPlayerEnhanced } from '@/components/VideoPlayerEnhanced';
import { OptimizedImage } from '@/components/OptimizedImage';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

export const VideoAreasGridOptimized = () => {
  const { videos, loading, error } = useVideos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedPlaylistUrl, setSelectedPlaylistUrl] = useState<string>('');
  
  const { playlist, loading: playlistLoading } = useYouTube(selectedPlaylistUrl);
  const { createDebouncedSearch, preloadImages } = usePerformanceOptimization();
  
  // Debounced search para melhor performance
  const debouncedSearch = useMemo(
    () => createDebouncedSearch((term: string) => setSearchTerm(term)),
    [createDebouncedSearch]
  );

  // Extrair ID do vídeo do YouTube - melhorada para diferentes formatos
  const extractVideoId = useCallback((url: string): string | null => {
    if (!url) return null;
    
    // Diferentes padrões de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ // ID direto
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }, []);

  // Agrupar vídeos por área com otimização
  const videoAreas = useMemo(() => {
    const areas: { [key: string]: { videos: typeof videos; count: number; thumbnail?: string } } = {};
    
    console.log('Videos recebidos:', videos); // Debug
    
    videos.forEach(video => {
      if (!areas[video.area]) {
        areas[video.area] = { videos: [], count: 0 };
      }
      areas[video.area].videos.push(video);
      areas[video.area].count++;
      
      // Usar thumbnail do primeiro vídeo como representação da área
      if (!areas[video.area].thumbnail && video.link) {
        const videoId = extractVideoId(video.link);
        console.log('Video ID extraído:', videoId, 'do link:', video.link); // Debug
        if (videoId) {
          areas[video.area].thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
    });
    
    console.log('Áreas processadas:', areas); // Debug
    return areas;
  }, [videos, extractVideoId]);

  // Filtrar áreas por busca
  const filteredAreas = useMemo(() => {
    if (!searchTerm) return videoAreas;
    
    const filtered: typeof videoAreas = {};
    Object.entries(videoAreas).forEach(([area, data]) => {
      if (area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.videos.some(video => video.link.toLowerCase().includes(searchTerm.toLowerCase()))) {
        filtered[area] = data;
      }
    });
    
    return filtered;
  }, [videoAreas, searchTerm]);


  const handleAreaSelect = useCallback((area: string) => {
    setSelectedArea(area);
  }, []);

  const handleVideoSelect = useCallback((video: any) => {
    setSelectedVideo(video);
    setSelectedPlaylistUrl(video.link);
  }, []);

  const handleBack = useCallback(() => {
    if (selectedVideo) {
      setSelectedVideo(null);
      setSelectedPlaylistUrl('');
    } else if (selectedArea) {
      setSelectedArea('');
    }
  }, [selectedVideo, selectedArea]);

  if (selectedVideo && playlist) {
    return <VideoPlayerEnhanced video={selectedVideo} playlist={playlist} onBack={handleBack} />;
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="text-center p-8 border-red-200 dark:border-red-800">
          <Video className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-red-500 mb-4 font-semibold">Erro ao carregar videoaulas</h2>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header com busca otimizada para mobile */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {selectedArea || 'Videoaulas Jurídicas'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {selectedArea 
                ? `${videoAreas[selectedArea]?.count || 0} vídeos disponíveis`
                : `${Object.keys(filteredAreas).length} áreas de estudo`
              }
            </p>
          </div>
          
          {selectedArea && (
            <Button variant="outline" onClick={handleBack} size="sm">
              ← Voltar às áreas
            </Button>
          )}
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={selectedArea ? "Buscar vídeos..." : "Buscar áreas ou videoaulas..."}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Grid principal */}
      {!selectedArea ? (
        // Grid de áreas - otimizado para mobile
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(filteredAreas).map(([area, data]) => (
            <Card
              key={area}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border-2 hover:border-red-500/30"
              onClick={() => handleAreaSelect(area)}
            >
              <div className="relative aspect-video bg-gradient-to-br from-red-500/20 to-pink-500/20 overflow-hidden">
                {data.thumbnail ? (
                  <OptimizedImage
                    src={data.thumbnail}
                    alt={area}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback para thumbnail alternativa em caso de erro
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('maxresdefault')) {
                        target.src = target.src.replace('maxresdefault', 'hqdefault');
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                    <Video className="h-12 w-12 text-red-400/60" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                
                {/* Badge com contagem */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-600/90 text-white">
                    {data.count} vídeo{data.count !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                {/* Ícone de play centralizado */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="absolute bottom-3 right-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                  {area}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    {data.count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Jurídico
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Grid de vídeos da área selecionada
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoAreas[selectedArea]?.videos
            .filter(video => 
              !searchTerm || video.link.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((video, index) => {
              const videoId = extractVideoId(video.link);
              const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
              
              return (
                <Card
                  key={video.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="relative aspect-video bg-muted">
                    {thumbnail ? (
                      <OptimizedImage
                        src={thumbnail}
                        alt="Vídeo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-pink-500/20" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-600/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                        <Play className="h-6 w-6 text-white ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Video number */}
                    <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                      #{index + 1}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                      Vídeo {video.id}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Videoaula
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        HD
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
      
      {/* Mensagem quando não há resultados */}
      {((selectedArea && videoAreas[selectedArea]?.videos.filter(video => 
          !searchTerm || video.link.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0) || 
        (!selectedArea && Object.keys(filteredAreas).length === 0)) && (
        <Card className="text-center p-8">
          <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground text-sm">
            {searchTerm 
              ? "Tente buscar por outro termo."
              : "Não há conteúdo disponível no momento."
            }
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              className="mt-4"
              size="sm"
            >
              Limpar busca
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};