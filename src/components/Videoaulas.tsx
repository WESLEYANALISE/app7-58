import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Search, NotebookPen, Film, Book, Palette, Grid, List } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VideoPlayerEnhanced } from '@/components/VideoPlayerEnhanced';
import { useVideosByCategory, type CategoryGroup, type VideoCategory, type YouTubePlaylist, type YouTubeVideo } from '@/hooks/useVideosByCategory';
interface DBVideoRow {
  id: number;
  area: string;
  link: string;
}
interface PlaylistCard extends DBVideoRow {
  playlistId?: string | null;
  meta?: YouTubePlaylist;
}
interface VideoStats {
  totalVideos: number;
  totalCategories: number;
  totalAreas: number;
}
export const Videoaulas = () => {
  const { setCurrentFunction } = useNavigation();
  const { categories, loading, error, searchVideos } = useVideosByCategory();
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    title: string;
    playlist: YouTubePlaylist;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'category-videos'>('categories');

  const handleBack = () => {
    if (selectedVideo) {
      setSelectedVideo(null);
      return;
    }
    if (viewMode === 'category-videos') {
      setViewMode('categories');
      setSelectedCategory(null);
      return;
    }
    setCurrentFunction(null);
  };
  // Debounced search
  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchVideos(searchTerm);
      setSearchResults(results);
    } catch (e) {
      console.error('Erro na busca:', e);
      setSearchResults([]);
    }
  }, [searchVideos]);

  // Calculate stats
  const stats: VideoStats = useMemo(() => {
    const totalVideos = categories.reduce((acc, cat) => acc + cat.totalVideos, 0);
    const totalAreas = categories.reduce((acc, cat) => acc + new Set(cat.items.map(item => item.area)).size, 0);
    
    return {
      totalVideos,
      totalCategories: categories.length,
      totalAreas
    };
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return categories;

    // Trigger video search when user types
    handleSearch(term);

    return categories
      .map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.categoria.toLowerCase().includes(term) ||
          item.area.toLowerCase().includes(term) ||
          item.meta?.title?.toLowerCase().includes(term)
        )
      }))
      .filter(category => category.items.length > 0);
  }, [categories, search, handleSearch]);

  // Get current category videos
  const currentCategoryVideos = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.categoria === selectedCategory);
    return category?.items || [];
  }, [categories, selectedCategory]);

  // Video player view
  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold truncate">{selectedVideo.title}</h1>
          </div>
        </div>

        <VideoPlayerEnhanced 
          video={{ area: selectedVideo.title }} 
          playlist={selectedVideo.playlist} 
          onBack={() => setSelectedVideo(null)} 
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 hover:bg-accent/80">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">
              {viewMode === 'categories' ? 'Videoaulas' : selectedCategory}
            </h1>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => setCurrentFunction('Minhas Anotações')} className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-600 border border-amber-200">
            <NotebookPen className="h-4 w-4" />
            Anotações
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        {!loading && (
          <div className="flex gap-2 flex-wrap mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {stats.totalVideos} vídeos
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {stats.totalCategories} categorias
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {stats.totalAreas} áreas
            </Badge>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Buscar vídeos, categorias ou áreas..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-10" 
          />
        </div>

        {/* Search Results */}
        {search && searchResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Resultados da busca no YouTube:</h3>
            <div className="grid grid-cols-1 gap-2">
              {searchResults.slice(0, 5).map((video) => (
                <Card 
                  key={video.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors" 
                  onClick={() => {
                    const videoPlaylist: YouTubePlaylist = {
                      id: video.id,
                      title: video.title,
                      description: video.description || '',
                      thumbnail: video.thumbnail,
                      videoCount: 1,
                      itemCount: 1,
                      videos: [video]
                    };
                    setSelectedVideo({
                      title: video.title,
                      playlist: videoPlaylist
                    });
                  }}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-16 h-12 object-cover rounded" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{video.channelTitle}</p>
                      {video.duration && (
                        <span className="text-xs text-muted-foreground">{video.duration}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Categories View */}
        {!loading && !search && viewMode === 'categories' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categorias de Vídeos</h3>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.categoria} 
                  className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
                  onClick={() => {
                    setSelectedCategory(category.categoria);
                    setViewMode('category-videos');
                  }}
                >
                  <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20 overflow-hidden">
                    {category.capa && (
                      <img 
                        src={category.capa} 
                        alt={category.categoria}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{category.categoria}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-white/20 text-white border-0">
                          {category.totalVideos} vídeos
                        </Badge>
                        <Badge className="bg-white/20 text-white border-0">
                          {category.items.length} playlists
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Videos View */}
        {!loading && viewMode === 'category-videos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedCategory}</h3>
              <Badge variant="secondary">
                {currentCategoryVideos.length} playlists
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentCategoryVideos.map((video) => {
                const thumb = video.meta?.thumbnail || video['capa-categoria'] || '/placeholder.svg';
                const count = video.meta?.videoCount || 0;
                
                return (
                  <Card 
                    key={video.id} 
                    className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300"
                    onClick={() => {
                      if (video.meta) {
                        setSelectedVideo({
                          title: video.meta.title,
                          playlist: video.meta
                        });
                      }
                    }}
                  >
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img 
                        src={thumb} 
                        alt={video.meta?.title || video.area} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/80 text-white text-xs">
                          {count} vídeos
                        </Badge>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                          <Play className="h-6 w-6 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {video.meta?.title || video.area}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{video.area}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtered Categories View (when searching) */}
        {!loading && search && filteredCategories.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Categorias encontradas ({filteredCategories.length}):
            </h3>
            {filteredCategories.map((category) => (
              <div key={category.categoria} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{category.categoria}</h4>
                  <Badge variant="outline">{category.items.length} resultados</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.items.slice(0, 4).map((video) => (
                    <Card 
                      key={video.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        if (video.meta) {
                          setSelectedVideo({
                            title: video.meta.title,
                            playlist: video.meta
                          });
                        }
                      }}
                    >
                      <CardContent className="p-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={video.meta?.thumbnail || '/placeholder.svg'} 
                            alt={video.area}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">{video.area}</p>
                            <p className="text-xs text-muted-foreground">
                              {video.meta?.videoCount || 0} vídeos
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {!loading && !search && categories.length === 0 && (
          <Card className="text-center p-8">
            <h3 className="font-semibold mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground text-sm">Não há vídeos disponíveis no momento.</p>
          </Card>
        )}

        {!loading && search && filteredCategories.length === 0 && searchResults.length === 0 && (
          <Card className="text-center p-8">
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground text-sm">
              Tente buscar por outros termos ou categorias.
            </p>
          </Card>
        )}

        {error && (
          <Card className="text-center p-8 border-destructive">
            <h3 className="font-semibold mb-2 text-destructive">Erro ao carregar vídeos</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </Card>
        )}
      </div>

      <FloatingFooterMenu />
    </div>
  );
};


// Floating Footer Menu Component
const FloatingFooterMenu = () => {
  const { setCurrentFunction } = useNavigation();
  
  const menuItems = [
    {
      id: 'juriflix',
      title: 'Juriflix',
      icon: Film,
      function: 'Juriflix',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'biblioteca',
      title: 'Biblioteca',
      icon: Book,
      function: 'Biblioteca de Estudos',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'mapas',
      title: 'Mapas Mentais',
      icon: Palette,
      function: 'Mapas Mentais',
      color: 'from-green-500 to-green-600'
    }
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden mx-auto max-w-md">
        <div className="flex items-center justify-around p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFunction(item.function)}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-white hover:bg-white/10"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};